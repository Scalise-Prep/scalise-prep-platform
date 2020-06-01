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
    checkboxTemplateId=myjson["checkboxTemplateId"]
    checkedBoxes=myjson["checkedBoxes"]
    userText=myjson["userText"]
    hold=myjson["hold"]
    timestamp=myjson["timeStamp"]
    
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
                if hold:
                    #hold this flashcard
                    sql = "UPDATE flashcard SET hold = %s WHERE flashcardId = %s"
                    val = (1, flashcardId)
                    mycursor.execute(sql, val)
                    mydb.commit()
                
                for i in range(len(checkedBoxes)):
                    #create new flashcard checkbox entry in database
                    sql = "INSERT INTO flashCheckboxResponses (flashcardId, checkboxTemplateId, checkboxId, timestamp, hold, userText) VALUES (%s, %s, %s, %s, %s, %s)"
                    val = (flashcardId, checkboxTemplateId, checkedBoxes[i], timestamp, hold, userText[i])
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