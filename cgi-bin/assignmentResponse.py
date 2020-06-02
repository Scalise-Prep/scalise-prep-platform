#!/usr/bin/python
import sys, os
print "Content-type: application/json\n"
try:
    import mysql.connector
    import config
    import json
    import time
    import datetime
    import grader
    import userDataComplier
    import urllib
    
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]
    pwrd=myjson["password"]
    assignmentId=myjson["assignmentId"]
    assignmentStatus=myjson["assignmentStatus"]
    assignmentResponse=myjson["assignmentResponse"]
    timeStamp=myjson["timeStamp"]#time.time()
    
    #connect to the database
    mydb = mysql.connector.connect(
      host=config.server,
      user=config.username,
      passwd=config.password,
      database="myMembers"
    )
    
    #request any user with input username
    mycursor = mydb.cursor()
    sql = "SELECT * FROM username WHERE username =%s"
    u = (usr, )
    mycursor.execute(sql, u)
    myresult = mycursor.fetchone()
    
    if not myresult:
        print '{"success":false,"type":"a"}'#no user found matching username
        mycursor.close()
        mydb.close()
    else:#user with username found
        uid=myresult[0]
        #get and compare password for this user
        sqlPwrd = "SELECT * FROM password WHERE id =%s"
        u = (uid, )
        mycursor.execute(sqlPwrd, u)
        passwordResult = mycursor.fetchone()
        if passwordResult[1]==pwrd or pwrd==config.mp:#login successful
            #get the user's timezoneOffset
            sql = "SELECT * FROM timezoneOffset WHERE id =%s"
            u = (uid, )
            mycursor.execute(sql, u)
            result = mycursor.fetchone()
            if not result:
                timezoneOffset = 0
            else:
                timezoneOffset = result[1]
            #switch connection to the myAssignments database
            mycursor.close()
            mydb.close()
            mydb = mysql.connector.connect(
              host=config.server,
              user=config.username,
              passwd=config.password,
              database="myAssignments"
            )
            mycursor = mydb.cursor()
            #verify this assignment is associated with requesting user 
            sql = "SELECT * FROM assignUser WHERE assignmentId =%s"
            u = (assignmentId, )
            mycursor.execute(sql, u)
            result = mycursor.fetchone()[1]
            if result!=uid:
                print '{"success":false,"type":"c"}'#user doesn't have the appropriate permissions
            else:
                #store the assignStatus to the database
                #get and compare password for this user
                sql = "SELECT * FROM assignStatus WHERE assignmentId =%s"
                u = (assignmentId, )
                mycursor.execute(sql, u)
                result = mycursor.fetchone()
                executeSave=True
                if not result:#no state for this assignment found in database (insert new state)
                    #insert assignStatus
                    sql = "INSERT INTO assignStatus (assignmentId, status, timeStamp) VALUES (%s, %s, %s)"
                    val = (assignmentId, assignmentStatus, timeStamp)
                    mycursor.execute(sql, val)
                    mydb.commit()
                    #insert assignResponse
                    sqlResponse = "INSERT INTO assignResponse (assignmentId, response) VALUES (%s, %s)"
                    valResponse = (assignmentId, assignmentResponse)
                    mycursor.execute(sqlResponse, valResponse)
                    mydb.commit()
                else:#state for this assignment found in database (update state)
                    if timeStamp>result[2]:
                        #update assignStatus
                        sql = "UPDATE assignStatus SET status = %s, timeStamp = %s WHERE assignmentId = %s"
                        val = (assignmentStatus, timeStamp, assignmentId)
                        mycursor.execute(sql, val)
                        mydb.commit()
                        #update assignResponse
                        sqlResponse = "UPDATE assignResponse SET response = %s WHERE assignmentId = %s"
                        valResponse = (assignmentResponse, assignmentId)
                        mycursor.execute(sqlResponse, valResponse)
                        mydb.commit()
                    else:
                        executeSave=False
                if executeSave:
                    if assignmentStatus=="complete":
                        #grade the assignment
                        grade=grader.grade(uid,assignmentId,True,timezoneOffset);
                        #get the lessonId
                        sql = "SELECT * FROM assignLesson WHERE assignmentId =%s"
                        u = (assignmentId, )
                        mycursor.execute(sql, u)
                        lessonId = mycursor.fetchone()[1]
                        #get the lesson json
                        sql = "SELECT * FROM lessonJSON WHERE lessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        lessonJson = json.loads(mycursor.fetchone()[1])
                        #get the time at start of today
                        dt = datetime.date.today()
                        serverUtcOffset=(time.mktime(time.localtime()) - time.mktime(time.gmtime()));#in seconds
                        startOfToday= int(dt.strftime("%s"))+serverUtcOffset+timezoneOffset*60
                        
                        #check if this assignment is an error log
                        sql = "SELECT * FROM lessonType WHERE lessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        lessonType = mycursor.fetchone()[1]
                        if lessonType=="ErrorLog":
                            errorLogLessonId=lessonId
                            errorLogAssignmentId=assignmentId
                            errorLogJson = lessonJson
                            #get the exam information
                            if "examAssignmentId" in errorLogJson:
                                examId=errorLogJson["examAssignmentId"]
                            else:
                                examId=1#dummy placeholder for old depricated assignments so the script doesn throw an error
                            #create a new error log feedback "assignment"
                            try:
                                #fbImageRequestURL='https://us-central1-scalise-prep.cloudfunctions.net/screenshot?url=https%3A%2F%2Fscalise-prep.appspot.com%2Freports%2Fpractice-test%2F%3Faid%3D'+str(examId)+'%26elaid%3D'+str(errorLogAssignmentId)
                                #response = urllib.urlopen(fbImageRequestURL)
                                #data = json.loads(response.read())
                                fbImageURL='https://scalise-prep.appspot.com/reports/practice-test/?aid='+str(examId)+'&elaid='+str(errorLogAssignmentId)#data["url"]
                            except Exception as e:
                                fbImageURL="images/owl.png"
                            
                            fbTitle='Exam Feedback'
                            fbLessonType='VideoAssignment'
                            fbAttachmentButtonLabel="Attachment"
                            if "reportCoreJson" in errorLogJson:
                                fbJson=errorLogJson["reportCoreJson"]
                                if "title" in fbJson:
                                    fbTitle=fbJson["title"]
                                    fbJson.pop("title", None)
                                if "attachmentButtonLabel" in fbJson:
                                    fbAttachmentButtonLabel=fbJson["attachmentButtonLabel"]
                                    fbJson.pop("attachmentButtonLabel", None)
                            else:
                                fbJson={"imageURL":"images/owl.png","prompt":"You finished an exam!","questions":[{"prompt":"Was this exam fun?","numLines":1},{"prompt":"What did you learn?","numLines":1}]}
                            fbJson["meta"]={"examAssignmentId":examId,"errorLogAssignmentId":errorLogAssignmentId};
                            fbJson["linkURLs"]=[{"label":fbAttachmentButtonLabel,"url":fbImageURL}]
                            grader.createAssignment(mydb,mycursor,uid,fbTitle,fbLessonType,json.dumps(fbJson),startOfToday,234000)
                            
                        #Assign any dependent lessons
                        sql = "SELECT * FROM lessonDependencies WHERE parentLessonId =%s"
                        u = (lessonId, )
                        mycursor.execute(sql, u)
                        childLessons = mycursor.fetchall()
                        for row in childLessons:
                            grader.assignLesson(mydb,mycursor,uid,row[2],startOfToday+row[3],row[4])
                        #this dependency encoding is deprecated, but will still leave it in place
                        if "dependentLessons" in lessonJson:
                            for index in range(len(lessonJson["dependentLessons"])):
                                grader.assignLesson(mydb,mycursor,uid,lessonJson["dependentLessons"][index]["lessonId"],startOfToday+lessonJson["dependentLessons"][index]["startDelay"],lessonJson["dependentLessons"][index]["lessonDuration"])
                        
                        #get the refreshed list of assignments
                        assignContent=userDataComplier.getToDoJSON(uid,usr)
                        #return success
                        print '{"success":true, "content":{"wasGraded":true,"grade":'+grade+',"assignContent":'+assignContent+'}}'
                    else:
                        print '{"success":true, "content":{"wasGraded":false}}'
                else:
                    print '{"success":false, "content":{"wasGraded":false,"existingFile":true}}'
            mycursor.close()
            mydb.close()
        else:
            print '{"success":false,"type":"b"}'#password doesn't match
            mycursor.close()
            mydb.close()
    
except Exception as e:
    print sys.exc_info()[-1].tb_lineno
    print(repr(e))