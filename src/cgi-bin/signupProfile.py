#!/usr/bin/python
try:
    import sys, os
    import mysql.connector
    import config
    import json
    
    print "Content-type: application/json\n"
    
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]
    pwrd=myjson["password"]
    grade=myjson["grade"]
    state=myjson["state"]
    actDate=myjson["actDate"]
    goalActScore=myjson["goalActScore"]
    favSubject=myjson["favSubject"]
    leastFavSubject=myjson["leastFavSubject"]
    goalUniversity=myjson["goalUniversity"]

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
        if passwordResult[1]==pwrd or passwordResult[1]==config.mp:#login successful
            #store the user profile in the database
            #insert grade
            sql = "INSERT INTO userGrade (userId, grade) VALUES (%s, %s)"
            val = (uid, grade)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert state
            sql = "INSERT INTO userState (userId, state) VALUES (%s, %s)"
            val = (uid, state)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert actDate
            sql = "INSERT INTO userActDate (userId, date) VALUES (%s, %s)"
            val = (uid, actDate)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert goalActScore
            sql = "INSERT INTO userGoalActScore (userId, goalScore) VALUES (%s, %s)"
            val = (uid, goalActScore)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert favSubject
            sql = "INSERT INTO userFavSubject (userId, favSubject) VALUES (%s, %s)"
            val = (uid, favSubject)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert leastFavSubject
            sql = "INSERT INTO userLeastFavSubject (userId, leastFavSubject) VALUES (%s, %s)"
            val = (uid, leastFavSubject)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert goalUniversity
            sql = "INSERT INTO userGoalUniversity (userId, goalUniversity) VALUES (%s, %s)"
            val = (uid, goalUniversity)
            mycursor.execute(sql, val)
            mydb.commit()
            #return success
            print '{"success":true}'
        else:
            print '{"success":false,"type":"b"}'#password doesn't match
            mycursor.close()
            mydb.close()
    
except Exception as e:
    print sys.exc_info()[-1].tb_lineno
    print(repr(e))