#!/usr/bin/python
try:
    import sys, os
    import mysql.connector
    import config
    import json
    import time
    import datetime
    import userDataComplier
    import assignUserCurriculum
    import emailConfig
    import sendMail
    
    print "Content-type: application/json\n"
    
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]
    email=myjson["email"]
    pwrd=myjson["password"]
    referral=myjson["referralCode"]
    timezoneOffset=myjson["timezoneOffset"]#in minutes
    
    #check referral code
    import referralConfig
    if referralConfig.code.lower()==referral.lower():
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
            #send alert message to admin to indicate new signup
            to = emailConfig.to
            sendMail.send(to,'New User Signup','Hi Admin,\n\nCongrats! A new user "'+usr+'" just signed up!\n\nSincerely,\nYour trusty automated scaliseprep.com website')
            
            #create a new user entry in the database
            sql = "INSERT INTO  username (username) VALUES (%s);"
            val = (usr, )
            mycursor.execute(sql, val)
            mydb.commit()
            #get the new user id
            uid = mycursor.lastrowid
            #fill in the remaining fields
            #password
            sql = "INSERT INTO  password (id, password) VALUES (%s, %s);"
            val = (uid, pwrd)
            mycursor.execute(sql, val)
            mydb.commit()
            #email
            sql = "INSERT INTO  email (id, email) VALUES (%s, %s);"
            val = (uid, email)
            mycursor.execute(sql, val)
            mydb.commit()
            #signupDate
            timestamp=time.time();
            sql = "INSERT INTO  signupDate (id, timestamp) VALUES (%s, %s);"
            val = (uid, timestamp)
            mycursor.execute(sql, val)
            mydb.commit()
            #lastLogin
            sql = "INSERT INTO  lastLogin (id, timestamp) VALUES (%s, %s);"
            val = (uid, timestamp)
            mycursor.execute(sql, val)
            mydb.commit()
            #loginCount
            sql = "INSERT INTO  loginCount (id, count) VALUES (%s, %s);"
            val = (uid, 1)
            mycursor.execute(sql, val)
            mydb.commit()
            #timezoneOffset
            sql = "INSERT INTO  timezoneOffset (id, offset) VALUES (%s, %s);"
            val = (uid, timezoneOffset)
            mycursor.execute(sql, val)
            mydb.commit()
            #close the connection
            mycursor.close()
            mydb.close()
            
            #assign default curriculum to the new user
            curriculumId=1;
            dt = datetime.date.today()
            serverUtcOffset=(time.mktime(time.localtime()) - time.mktime(time.gmtime()));#in seconds
            startOfToday= int(dt.strftime("%s"))+serverUtcOffset+timezoneOffset*60
            assignUserCurriculum.assignCurriculum(uid,1,startOfToday);
            
            #return success
            content=userDataComplier.getToDoJSON(uid,usr);
            print '{"success":true,"content":'+content+'}'
        else:
            print '{"success":false,"failureMode":"username"}'#user with username already exists
            mycursor.close()
            mydb.close()
    else:
        print '{"success":false,"failureMode":"referralCode"}'#referralCode doesn't match
    
except Exception as e:
  print(e)