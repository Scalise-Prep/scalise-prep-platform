#!/usr/bin/python
import sys, os
import mysql.connector
import config

def assignCurriculum(userId,curriculumId,startTime):
    try:
        #connect to the database
        mydb = mysql.connector.connect(
          host=config.server,
          user=config.username,
          passwd=config.password,
          database="myAssignments"
        )
        mycursor = mydb.cursor()
        #load curriculum from databse
        sql = "SELECT * FROM curriculumLesson WHERE curriculumId =%s"
        u = (curriculumId, )
        mycursor.execute(sql, u)
        resultLessons = mycursor.fetchall()
        
        #assign all lessons found in the curriculum to the user
        for row in resultLessons:
            lessonId=int(row[2])
            lessonStartTime=int(row[3])+startTime
            if int(row[4])>0:
                lessonDueTime=int(row[4])+startTime
            else:
                lessonDueTime=0
            
            #assign lesson to user
            #insert assignUser
            sql = "INSERT INTO assignUser (assignmentId, userId) VALUES (%s, %s)"
            val = ("NULL",userId)
            mycursor.execute(sql, val)
            mydb.commit()
            assignmentId = mycursor.lastrowid#get the assignmentId from this auto increment
            #insert assignLesson
            sql = "INSERT INTO assignLesson (assignmentId, lessonId) VALUES (%s, %s)"
            val = (assignmentId,lessonId)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert assignStartDate
            sql = "INSERT INTO assignStartDate (assignmentId, startDate) VALUES (%s, %s)"
            val = (assignmentId,lessonStartTime)
            mycursor.execute(sql, val)
            mydb.commit()
            #insert assignDueDate
            if lessonDueTime>0:
                sql = "INSERT INTO assignDueDate (assignmentId, dueDate) VALUES (%s, %s)"
                val = (assignmentId,lessonDueTime)
                mycursor.execute(sql, val)
                mydb.commit()
            
        mycursor.close()
        mydb.close()
        return "success"
    except Exception as e:
        return "Error on line "+str(sys.exc_info()[-1].tb_lineno)+". "+repr(e)