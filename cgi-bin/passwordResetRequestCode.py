#!/usr/bin/python
import sys, os
import mysql.connector
import config
import json
import sendMail
import emailConfig

print "Content-type: application/json\n"
try:
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]

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
        print '{"success":false,"failureMode":"user"}'#no user found matching username
        mycursor.close()
        mydb.close()
    else:#user with username found
        uid=myresult[0]
        #get email for this user
        sqlEmail = "SELECT * FROM email WHERE id =%s"
        u = (uid, )
        mycursor.execute(sqlEmail, u)
        emailResult = mycursor.fetchone()[1]
        if emailResult:
            #get email for this user
            sqlPwrd = "SELECT * FROM password WHERE id =%s"
            u = (uid, )
            mycursor.execute(sqlPwrd, u)
            pwrd = mycursor.fetchone()[1]
            to = emailResult
            message='You requested your Scalise Prep password, it is:\n'+pwrd
            sendMail.send(to,"Scalise Prep Password",message)
            print '{"success":true}'
        else:
            print '{"success":false,"failureMode":"email"}'#no user found matching username
        mycursor.close()
        mydb.close()
    
except Exception as e:
    print sys.exc_info()[-1].tb_lineno
    print(repr(e))