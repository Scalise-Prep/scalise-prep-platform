#!/usr/bin/python
import sys, os
import json
import mysql.connector
import time
import datetime
import config

def grade(userId,assignId,save2Db,timezoneOffset):
    try:
        #connect to the database
        mydb = mysql.connector.connect(
          host=config.server,
          user=config.username,
          passwd=config.password,
          database="myAssignments"
        )
        mycursor = mydb.cursor()
        
        #BEGIN CALCULATE the GRADE
        grade={}
        #get the lessonId
        sql = "SELECT * FROM assignLesson WHERE assignmentId =%s"
        u = (assignId, )
        mycursor.execute(sql, u)
        lessonId = mycursor.fetchone()[1]
        #get the lessonType
        sql = "SELECT * FROM lessonType WHERE lessonId =%s"
        u = (lessonId, )
        mycursor.execute(sql, u)
        lessonType = mycursor.fetchone()[1]
        #compute grade based on lessonType
        sectionCanBeGraded=False;
        if lessonType=="Exam":
            sectionCanBeGraded=True;
            grade["sectionRawScores"]={}
            grade["sectionScaleScores"]={}
            #get the lessonTitle
            sql = "SELECT * FROM lessonTitle WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sql, u)
            lessonTitle = mycursor.fetchone()[1]
            #get the lessonJson
            sql = "SELECT * FROM lessonJSON WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sql, u)
            lessonJson = json.loads(mycursor.fetchone()[1])
            #get the answerKey
            sql = "SELECT * FROM lessonAnswerKey WHERE lessonId =%s"
            u = (lessonId, )
            mycursor.execute(sql, u)
            answerKey = json.loads(mycursor.fetchone()[1])
            #get the responseJson
            sql = "SELECT * FROM assignResponse WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sql, u)
            responseJson = json.loads(mycursor.fetchone()[1])
            
            #grade each section
            areAllQuestionsCorrect=1
            numSections=len(answerKey["sections"])
            averageScore=0
            if "errorLogCoreJson" in lessonJson:
                errorLogJson=lessonJson["errorLogCoreJson"]
            else:#default error log json
                errorLogJson={"prompt":"Please review the following missed questions from your recent exam.","imageURL":"images/errorLog.png"}
            errorLogJson["questions"]=[]
            for section in range(numSections):
                rawScore=0
                sectionTopic=responseJson["sections"][section]["topic"]
                numQuestions=len(answerKey["sections"][section]["answers"])
                numResponses=len(responseJson["sections"][section]["recordedAnswers"])
                for question in range(numQuestions):
                    yourAnswer=responseJson["sections"][section]["recordedAnswers"][question]
                    correctAnswer=answerKey["sections"][section]["answers"][question]
                    answerChoices=lessonJson["sections"][section]["answerChoices"]
                    answerChoicesIndex=question%len(answerChoices)
                    if question<numResponses and yourAnswer==correctAnswer:#correct
                        rawScore+=1 
                    else:#incorrect
                        areAllQuestionsCorrect=0
                        timeStamp=time.time()
                        assignFlashcard(mydb,mycursor,userId,(timeStamp+3600*24*7),lessonId,assignId,section,question)#create flashcard entry
                        #check if flashcard has a template
                        #!!!!!sql = "SELECT * FROM flashTemplate2Lesson WHERE lessonId = %s AND sectionId = %s AND questionId = %s"
                        #u = (lessonId, section, question)
                        #mycursor.execute(sql, u)
                        #result = mycursor.fetchone()
                        #if result:#if flashTemplate2Lesson entry exists
                            #templateId=result[1]
                            #sql = "SELECT * FROM flashTemplate WHERE templateId = %s"
                            #u = (templateId)
                            #mycursor.execute(sql, u)
                            #templateJson = json.loads(mycursor.fetchone()[1])
                            #if "auxCards" in templateJson:#flashcard template has auxiliary cards
                                #for i=[1:length(templateCoupledCardIds)]:
                                    #tempLessonId=
                                    #tempAssignId=
                                    #tempSectionId=
                                    #tempQuestionId=
                                    #assignFlashcard(mydb,mycursor,userId,timeStamp,tempLessonId,tempAssignId,tempSectionId,tempQuestionId)#create auxiliary flashcard entry
                        if yourAnswer is None:
                            yourAnswerString="None"
                        else:
                            yourAnswerString=answerChoices[answerChoicesIndex][yourAnswer]
                        correctAnswerString=answerChoices[answerChoicesIndex][correctAnswer]
                        jsonToAdd={"title":lessonJson["sections"][section]["title"]+", Q#"+str(question+1), "yourAnswer":yourAnswerString,"correctAnswer":correctAnswerString}
                        if ("videos" in answerKey["sections"][section]) and len(answerKey["sections"][section]["videos"])>question and answerKey["sections"][section]["videos"][question]:
                            jsonToAdd["videoURL"]=answerKey["sections"][section]["videos"][question]
                        errorLogJson["questions"].append(jsonToAdd)#create error log entry
                grade["sectionRawScores"][sectionTopic]=rawScore
                scaledScore=answerKey["sections"][section]["scoreScale"][rawScore]
                grade["sectionScaleScores"][sectionTopic]=scaledScore
                averageScore+=scaledScore
            if not areAllQuestionsCorrect:
                dt = datetime.date.today()
                serverUtcOffset=(time.mktime(time.localtime()) - time.mktime(time.gmtime()));#in seconds
                startOfToday= int(dt.strftime("%s"))+serverUtcOffset+timezoneOffset*60
                if "title" in errorLogJson:
                    errorLogTitle=errorLogJson["title"]
                    errorLogJson.pop("title", None)
                else:
                    errorLogTitle="Error Log: "+str(lessonTitle)
                errorLogJson["examAssignmentId"]=assignId
                createAssignment(mydb,mycursor,userId,errorLogTitle,"ErrorLog",json.dumps(errorLogJson),startOfToday,234000)
            grade["score"]=averageScore/float(numSections)
            
        gradeString=json.dumps(grade)
        if save2Db and sectionCanBeGraded:
            #check if entry already exists
            sql = "SELECT * FROM assignGrade WHERE assignmentId =%s"
            u = (assignId, )
            mycursor.execute(sql, u)
            result = mycursor.fetchall()
            if not result:#no grade for this assignment found in database (insert new grade)
                sql = "INSERT INTO assignGrade (assignmentId, grade) VALUES (%s, %s)"
                val = (assignId, gradeString)
                mycursor.execute(sql, val)
                mydb.commit()
            else:#grade for this assignment found in database (update grade)
                sql = "UPDATE assignGrade SET grade = %s WHERE assignmentId = %s"
                val = (gradeString, assignId)
                mycursor.execute(sql, val)
                mydb.commit()
        mycursor.close()
        mydb.close()
        return gradeString;
    except Exception as e:
        mycursor.close()
        mydb.close()
        return "Error on line "+str(sys.exc_info()[-1].tb_lineno)+". "+repr(e)

def assignFlashcard(mydb,mycursor,userId,timeStamp,lessonId,assignId,sectionId,questionId):
    #check if flashcard already exists
    sql = "SELECT * FROM flashcard2Assignment WHERE assignmentId = %s AND sectionId = %s AND questionId = %s"
    u = (assignId, sectionId, questionId)
    mycursor.execute(sql, u)
    result = mycursor.fetchall()
    if not result:#no flashcard for this (assignment, section, question) index yet
        #insert new row into flashcard
        sql = "INSERT INTO flashcard (userId, creationDate, latestAttemptDate, numAttempts, correctAttempts, correctStreak,hold) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        val = (userId, timeStamp, timeStamp, 0, 0, 0, 0)
        mycursor.execute(sql, val)
        mydb.commit()
        #get the new flashcardId
        flashcardId = mycursor.lastrowid
        #insert new row into flashcard2Assignment
        sql = "INSERT INTO flashcard2Assignment (flashcardId, assignmentId, sectionId, questionId) VALUES (%s, %s, %s, %s)"
        val = (flashcardId, assignId, sectionId, questionId)
        mycursor.execute(sql, val)
        mydb.commit()
        
        #####!!!!!The first half of the following section (up until the else statement) is deprecated, it links flashcards to assignments instead of lessons, but I want to leave it in place for now
        #check if assignment/question row exists in flashTemplate2Assignment
        sql = "SELECT * FROM flashTemplate2Assignment WHERE assignmentId = %s AND sectionId = %s AND questionId = %s"
        u = (assignId, sectionId, questionId)
        mycursor.execute(sql, u)
        result = mycursor.fetchone()
        if result:#if flashTemplate2Assignment entry exists
            templateId=result[1]
            #insert new row into flashcard2Template
            sql = "INSERT INTO flashcard2Template (flashcardId, templateId) VALUES (%s, %s)"
            val = (flashcardId, templateId)
            mycursor.execute(sql, val)
            mydb.commit()
        else:
            #####!!!!!end deprecated section
            #check if lesson/question row exists in flashTemplate2Lesson
            sql = "SELECT * FROM flashTemplate2Lesson WHERE lessonId = %s AND sectionId = %s AND questionId = %s"
            u = (lessonId, sectionId, questionId)
            mycursor.execute(sql, u)
            result = mycursor.fetchone()
            if result:#if flashTemplate2Lesson entry exists
                templateId=result[1]
                #insert new row into flashcard2Template
                sql = "INSERT INTO flashcard2Template (flashcardId, templateId) VALUES (%s, %s)"
                val = (flashcardId, templateId)
                mycursor.execute(sql, val)
                mydb.commit()
        
def createAssignment(mydb,mycursor,userId,lessonTitle,lessonType,lessonJsonText,startTime,assignmentDuration):
    #create the new lesson
    #insert new row into lessonJSON
    sql = "INSERT INTO lessonJSON (lessonId, json) VALUES (%s,%s)"
    val = (0,lessonJsonText)
    mycursor.execute(sql, val)
    mydb.commit()
    #get the new lessonId
    lessonId = mycursor.lastrowid
    #insert new row into lessonType
    sql = "INSERT INTO lessonType (lessonId, lessonType) VALUES (%s,%s)"
    val = (lessonId,lessonType)
    mycursor.execute(sql, val)
    mydb.commit()
    #insert new row into lessonTitle
    sql = "INSERT INTO lessonTitle (lessonId, lessonTitle) VALUES (%s,%s)"
    val = (lessonId,lessonTitle)
    mycursor.execute(sql, val)
    mydb.commit()
    
    #assign the new lesson
    assignLesson(mydb,mycursor,userId,lessonId,startTime,assignmentDuration)

def assignLesson(mydb,mycursor,userId,lessonId,startTime,assignmentDuration):
    #insert new row into assignUser
    sql = "INSERT INTO assignUser (assignmentId,userId) VALUES (%s,%s)"
    val = (0,userId)
    mycursor.execute(sql, val)
    mydb.commit()
    #get the new assignmentId
    assignmentId = mycursor.lastrowid
    #insert new row into assignLesson
    sql = "INSERT INTO assignLesson (assignmentId,lessonId) VALUES (%s,%s)"
    val = (assignmentId,lessonId)
    mycursor.execute(sql, val)
    mydb.commit()
    #insert new row into assignStartDate
    sql = "INSERT INTO assignStartDate (assignmentId,startDate) VALUES (%s,%s)"
    val = (assignmentId,startTime)
    mycursor.execute(sql, val)
    mydb.commit()
    #insert new row into assignStartDate
    dueDate=startTime+assignmentDuration
    sql = "INSERT INTO assignDueDate (assignmentId,dueDate) VALUES (%s,%s)"
    val = (assignmentId,dueDate)
    mycursor.execute(sql, val)
    mydb.commit()
    