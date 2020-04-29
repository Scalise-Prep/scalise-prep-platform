#!/usr/bin/python
import sys, os
import json
import mysql.connector
import time
import config

def getToDoJSON(uid,username):
    try:
        currTime=time.time()
        #initialize json
        myJson = {}
        myJson['user'] = {}
        myJson['user']['id'] = uid
        myJson['user']['name'] = username
        myJson['flashcards'] = []#[{"id":0,"title":"Addition","prompt":"1+1=?","answers":["0","1","2","3"],"correct":2},{"id":1,"title":"Planets","prompt":"Which is the largest planet in the Solar System?","answers":["Earth","Neptune","The Sun","Jupiter"],"correct":3},{"id":2,"title":"Elements","prompt":"Which element contains precisely 1 proton?","answers":["Helium","Hydrogen","Uranium"],"correct":1}]
        
        #connect to the database
        mydb = mysql.connector.connect(
          host=config.server,
          user=config.username,
          passwd=config.password,
          database="myAssignments"
        )
        mycursor = mydb.cursor()
        
        #load the assignments section
        #find all assignments in the database assigned to this user
        sql = "SELECT * FROM assignUser WHERE userId =%s"
        u = (uid, )
        mycursor.execute(sql, u)
        myresult = mycursor.fetchall()
        #construct the assignment json
        myJson['assignments'] = []
        myJson['assignResponse'] = []
        myJson['examScores'] = []
        
        for row in myresult:
            assignId=int(row[0])#the assignmentId of the current row's assignment in the database
            
            #check if the assignment is available yet
            sqlAssignStartDate = "SELECT * FROM assignStartDate WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sqlAssignStartDate, u)
            startDate=mycursor.fetchone()[1]
            if currTime<startDate:
                continue#this assignment isn't assigned yet, so skip to the next assignment
            
            #get the lessonId (for the default json for this assignment)
            sqlLessonId = "SELECT * FROM assignLesson WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sqlLessonId, u)
            lessonId=int(mycursor.fetchone()[1])
            
            #get the lessonType
            sqlLessonType = "SELECT * FROM lessonType WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sqlLessonType, u)
            lessonType=mycursor.fetchone()[1]
            
            #check if the assignment is already completed
            sql = "SELECT * FROM assignStatus WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sql, u)
            row = mycursor.fetchone()
            if (row!=None and row[1]=="complete"):
                if lessonType=="Exam":
                    completionTimeStamp=row[2]
                    #get the score
                    sql= "SELECT * FROM assignGrade WHERE assignmentId =%s"
                    u = (assignId, )
                    mycursor.execute(sql, u)
                    scoreJson=json.loads(mycursor.fetchone()[1])
                    scoreJson["completionTimeStamp"]=completionTimeStamp
                    myJson['examScores'].append(scoreJson)
                continue#this assignment is already completed, so skip to the next assignment
            
            #otherwise continue constructing the assignment json
            index=int(len(myJson['assignments']))# the current index of myJson['assignments']
            #get the default lessonJSON (for the default json for this assignment)
            sqlLessonJSON = "SELECT * FROM lessonJSON WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sqlLessonJSON, u)
            myJson['assignments'].append(json.loads(mycursor.fetchone()[1]))
            
            #add the startDate
            myJson['assignments'][index]['start']=startDate
            
            #add the lessonId to the json object
            myJson['assignments'][index]['id']=assignId
            
            #add the lessonType
            myJson['assignments'][index]['type']=lessonType
            
            #get the lessonTitle
            sqlLessonTitle = "SELECT * FROM lessonTitle WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sqlLessonTitle, u)
            myJson['assignments'][index]['title']=mycursor.fetchone()[1]
            
            #get the assignDueDate
            sqlAssignDueDate = "SELECT * FROM assignDueDate WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sqlAssignDueDate, u)
            myresult = mycursor.fetchone()
            if myresult:
                myJson['assignments'][index]['due']=myresult[1]
            
            #get the assignResponse
            sql = "SELECT * FROM assignResponse WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sql, u)
            row = mycursor.fetchone()#[1]
            if row==None:
                myJson['assignResponse'].append({})
            else:
                myJson['assignResponse'].append(json.loads(row[1]))
        
        #load the flashcards
        if uid>0:#uid==1 or uid==54:#!!!!!this line can be used to disable flashcards for everyone except a few test users... currently flashcards for all users are enabled
            #find when last flashcards were assigned
            flashcardJson=[]
            sql = "SELECT * FROM flashUserMeta WHERE userId =%s"
            u = (uid, )
            mycursor.execute(sql, u)
            result = mycursor.fetchone()
            maxFlashcardsPerDay=5
            if not result:#user does not have a flashUserMeta entry yet
                numFlashcardsAllowed=maxFlashcardsPerDay
            else:
                latestDateFlashcard=result[2]#this is going to be midnight on the morning of the lastest day that flashcards were assigned
                if currTime-latestDateFlashcard<24*3600:
                    numFlashcardsAllowed=maxFlashcardsPerDay-result[3]
                else:
                    numFlashcardsAllowed=maxFlashcardsPerDay
            #get complete list of flashcards assigned to the user
            sql = "SELECT * FROM flashcard WHERE userId =%s"
            u = (uid, )
            mycursor.execute(sql, u)
            myresult = mycursor.fetchall()
            for row in myresult:
                if numFlashcardsAllowed<=0:
                    break
                #get the flashcard metadata
                hold=row[7]
                latestAttemptDate=int(row[3])
                correctStreak=int(row[6])
                if numFlashcardsAllowed>0 and (not hold) and currTime-latestAttemptDate>24*3600*(1+pow(2,correctStreak)):#this flashcard is ready to be assigned again
                    flashcardId=int(row[0])
                    #get template
                    sql = "SELECT * FROM flashcard2Template WHERE flashcardId =%s"
                    u = (flashcardId, )
                    mycursor.execute(sql, u)
                    result = mycursor.fetchone()
                    if result:
                        templateId=result[2]
                        sql = "SELECT * FROM flashTemplate WHERE templateId =%s"
                        u = (templateId, )
                        mycursor.execute(sql, u)
                        tempJson = json.loads(mycursor.fetchone()[1])
                    else:
                        tempJson = {}
                    tempJson['id']=flashcardId
                    #get assignment
                    sql = "SELECT * FROM flashcard2Assignment WHERE flashcardId =%s"
                    u = (flashcardId, )
                    mycursor.execute(sql, u)
                    result = mycursor.fetchone()
                    lessonJSONFound=False
                    lessonJSON=None
                    if result:#flashcard is associated with an assignment
                        #get the assign, section, and question ids
                        assignmentId=result[2]
                        sectionId=result[3]
                        questionId=result[4]
                        tempJson['questionId']=questionId
                        #get the lessonId
                        sql = "SELECT * FROM assignLesson WHERE assignmentId =%s"
                        u = (assignmentId, )
                        mycursor.execute(sql, u)
                        lessonId = mycursor.fetchone()[1]
                        #get the lessonTitle
                        sql = "SELECT * FROM lessonTitle WHERE lessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        tempJson['assignmentTitle'] = mycursor.fetchone()[1]
                        #get the lessonJSON
                        sql = "SELECT * FROM lessonJSON WHERE lessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        lessonJSON = json.loads(mycursor.fetchone()[1])
                        lessonJSONFound=True
                        #get the section name
                        tempJson['sectionTitle']=lessonJSON['sections'][sectionId]["title"]
                        #get the answer choices
                        tempJson['answers']=lessonJSON['sections'][sectionId]["answerChoices"][questionId%len(lessonJSON['sections'][sectionId]["answerChoices"])]
                        #get the correctAnswer
                        sql = "SELECT * FROM lessonAnswerKey WHERE lessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        result = mycursor.fetchone()
                        if result:
                            answerKey=json.loads(result[1])
                            tempJson['correct']=answerKey['sections'][sectionId]['answers'][questionId]
                    #Get the checkbox template
                    if 'checkboxTemplate' in tempJson:#checkbox template in json
                        #query database for active default template
                        sql = "SELECT * FROM flashCheckboxTemplate WHERE templateId =%s"
                        u = (tempJson['checkboxTemplate']['templateId'])
                        mycursor.execute(sql, u)
                        result = mycursor.fetchone()
                        tempJson['checkboxTemplate']=json.loads(result[3])#store template in tempJson
                        tempJson['checkboxTemplate']['templateId']=result[0];
                    else:#no checkbox template in json
                        needsGeneralTemplate=False
                        if lessonJSONFound and ('topic' in lessonJSON['sections'][sectionId]):#question's sectionType is defined
                            sectionType=lessonJSON['sections'][sectionId]['topic'];
                            #query database for active checkboxTemplate for this sectionType
                            sql = "SELECT * FROM flashCheckboxTemplate WHERE sectionType =%s AND active=%s"
                            u = (sectionType, 1)
                            mycursor.execute(sql, u)
                            result = mycursor.fetchone()
                            if result:#template found during query
                                tempJson['checkboxTemplate']=json.loads(result[3])#store template in tempJson
                                tempJson['checkboxTemplate']['templateId']=result[0];
                            else:
                                needsGeneralTemplate=True
                        else:
                            needsGeneralTemplate=True
                        if needsGeneralTemplate:
                            #query database for active default template
                            sql = "SELECT * FROM flashCheckboxTemplate WHERE sectionType =%s AND active=%s"
                            u = ('default', 1)
                            mycursor.execute(sql, u)
                            result = mycursor.fetchone()
                            if result:#store default template in tempJson
                                tempJson['checkboxTemplate']=json.loads(result[3])#store template in tempJson
                                tempJson['checkboxTemplate']['templateId']=result[0];
                    #save the tempJson card into the flashcardJson array
                    flashcardJson.append(tempJson)
                    numFlashcardsAllowed-=1
            if len(flashcardJson):
                #insert into myJson['assignments']
                tempJson={}
                tempJson['type']='SpacedInterval'
                tempJson['imageURL']='images/errorLog.png'
                tempJson['flashcards']=flashcardJson
                myJson['assignments'].insert(0,tempJson)
                myJson['assignResponse'].insert(0,{})
        
        mycursor.close()
        mydb.close()
        return json.dumps(myJson)
    except Exception as e:
        return "Error on line "+str(sys.exc_info()[-1].tb_lineno)+". "+repr(e)