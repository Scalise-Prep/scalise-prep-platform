#!/usr/bin/python
import sys, os
import mysql.connector
import json
import #loadPythonFileName here to call its function

print "Content-type: application/json\n"
try:
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    userId=myjson["userId"]
    curriculumId=myjson["curriculumId"]
    startTime=myjson["startTime"]
    
    response=#loadPythonFileName.methodName(userId,curriculumId,startTime);
    print '{"success":true,"content":'+response+'}'

except Exception as e:
  print(e)
  print("Karina added this line to troubleshoot")