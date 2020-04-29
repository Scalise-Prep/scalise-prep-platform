#!/usr/bin/python
import sys, os
import mysql.connector
import config
import json
import time
import userDataComplier

print "Content-type: application/json\n"
try:
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    usr=myjson["username"]
    pwrd=myjson["password"]
    
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
        print '{"success":false}'#no user found matching username
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
            #return the requested data
            content=userDataComplier.getToDoJSON(uid,usr)
            print '{"success":true,"content":'+content+'}'
            #update login count in the database
            sqlLoginCount = "SELECT * FROM loginCount WHERE id =%s"
            u = (uid, )
            mycursor.execute(sqlLoginCount, u)
            loginCountResult = int(mycursor.fetchone()[1])+1
            sqlLoginCountUpdate = "UPDATE loginCount SET count = %s WHERE id = %s"
            val = (loginCountResult, uid)
            mycursor.execute(sqlLoginCountUpdate,val)
            mydb.commit()
            #update the last login timestamp in the database
            sqlLastLoginUpdate = "UPDATE lastLogin SET timestamp = %s WHERE id = %s"
            val = (time.time(), uid)
            mycursor.execute(sqlLastLoginUpdate,val)
            mydb.commit()
            mycursor.close()
            mydb.close()
        else:
            print '{"success":false}'#password doesn't match
            mycursor.close()
            mydb.close()
    
except Exception as e:
    print sys.exc_info()[-1].tb_lineno
    print(repr(e))