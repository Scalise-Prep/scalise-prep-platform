#!/usr/bin/python
import sys, os
import mysql.connector
import config
import json
import time
import datetime

print "Content-type: application/json\n"

try:
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]
    pwrd=myjson["password"]
    flashcardId=myjson["flashcardId"]
    isCorrect=myjson["isCorrect"]
    timeStamp=time.time()
    
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
            #obtain local timezone offset
            sql = "SELECT * FROM timezoneOffset WHERE id =%s"
            u = (uid, )
            mycursor.execute(sql, u)
            myresult=mycursor.fetchone()
            if not myresult:
                timezoneOffset=0
            else:
                timezoneOffset = myresult[1]
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
            #verify this flashcard is associated with requesting user 
            sql = "SELECT * FROM flashcard WHERE flashcardId =%s"
            u = (flashcardId, )
            mycursor.execute(sql, u)
            result = mycursor.fetchone()
            if result[1]!=uid:
                print '{"success":false,"type":"c"}'#user doesn't have the appropriate permissions
            else:
                #access data
                numAttempts = int(result[4])+1
                correctAttempts = int(result[5]) + (1 if isCorrect else 0)
                correctStreak = int(result[6])+1 if isCorrect else 0
                #update flashcard
                sql = "UPDATE flashcard SET latestAttemptDate = %s, numAttempts = %s, correctAttempts = %s, correctStreak = %s WHERE flashcardId = %s"
                val = (timeStamp, numAttempts, correctAttempts, correctStreak, flashcardId)
                mycursor.execute(sql, val)
                mydb.commit()
                #update flashUserMeta for this user
                dt = datetime.date.today()
                serverUtcOffset=(time.mktime(time.localtime()) - time.mktime(time.gmtime()));#in seconds
                startOfToday= int(dt.strftime("%s"))+serverUtcOffset+timezoneOffset*60;
                sql = "SELECT * FROM flashUserMeta WHERE userId =%s"
                u = (uid, )
                mycursor.execute(sql, u)
                result = mycursor.fetchone()
                if not result:#no row for this user found in database (insert new row)
                    sql = "INSERT INTO flashUserMeta (userId, latestDateFlashcard, numFlashcardsLatestDate) VALUES (%s, %s, %s)"
                    val = (uid, startOfToday, 1)
                    mycursor.execute(sql, val)
                    mydb.commit()
                else:#row found for this user (update the row)
                    sql = "UPDATE flashUserMeta SET latestDateFlashcard = %s, numFlashcardsLatestDate = %s WHERE userId = %s"
                    if startOfToday-result[2]<86400:#latestDateFlashcard is same day
                        numCards=result[3]
                        val = (startOfToday, numCards+1, uid)
                    else:#previous flashcards were done on a different day
                        val = (startOfToday, 1, uid)
                    mycursor.execute(sql, val)
                    mydb.commit()
            #return success
            print '{"success":true}'
            mycursor.close()
            mydb.close()
        else:
            print '{"success":false,"type":"b"}'#password doesn't match
            mycursor.close()
            mydb.close()
    
except Exception as e:
    print sys.exc_info()[-1].tb_lineno
    print(repr(e))