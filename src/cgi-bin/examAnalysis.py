#!/usr/bin/python
#The above is a header to tell godaddy where to find python installation (may or may not be necessary)

#Imports----------------------------------------------
import numpy as np
import time
from runQuery import runQuery
import json

#Set Selection Parameters-----------------------------
assignmentId = 478
errorLogAssignmentId = "479" #"na" if not done yet

#Run Queries------------------------------------------
#Q1: Assignment Name and Grade
q = '''
SELECT lessonTitle, grade 
FROM myAssignments.assignLesson aL
LEFT JOIN myAssignments.lessonTitle lT ON aL.lessonId = lT.lessonId
LEFT JOIN myAssignments.assignGrade aG ON aG.assignmentId = aL.assignmentId
WHERE aL.assignmentId = '{0}';
'''.format(assignmentId)
qr, tableObj = runQuery(q)
title=qr[0][0]
scoreInfo=json.loads(qr[0][1])
compositeScore = scoreInfo['score']

#Q2: Assignment Response
q = '''
SELECT response 
FROM myAssignments.assignResponse
WHERE assignmentId = '{0}';
'''.format(assignmentId)
qr, tableObj = runQuery(q)
responseJsonStr = qr[0][0]
respPy = json.loads(responseJsonStr) #json to python dict

#Q3: Answer Key
q = '''
SELECT answerKey 
FROM myAssignments.assignLesson aL
LEFT JOIN myAssignments.lessonAnswerKey lAK ON aL.lessonId = lAK.lessonId
WHERE assignmentId = '{0}';
'''.format(assignmentId)
qr, tableObj = runQuery(q)
keyJsonStr = qr[0][0]
keyPy = json.loads(keyJsonStr)

#Q4: ErrorLog Info
q = '''
SELECT response 
FROM myAssignments.assignResponse
WHERE assignmentId = '{0}';
'''.format(errorLogAssignmentId)
qr, tableObj = runQuery(q)
responseJsonStr = qr[0][0]
errorLogPy = json.loads(responseJsonStr) #json to python dict

#GET DATA ELEMENTS----------------------------------------------------
checkTypes=["TOTAL GUESS","PARTIAL GUESS","HARD/OTHER"];  #hardcoded checkbox meaning (better to do this dynamically from database at some point)
#Extract Response Data
sectionResp = respPy['sections'][0] #pull out first section (= only section if practice exam was 1 section)
times = sectionResp['answerTimeStamps'];
resps = sectionResp['recordedAnswers'];
tEnd = sectionResp['completeTimeStamp'];
tStart = sectionResp['startTimeStamp'];
checks = sectionResp['checkboxStates'];
#Extract Answer Key Data
sectionKey = keyPy['sections'][0]
key = sectionKey['answers']
score = sectionKey['scoreScale']
#Get number of questions
nQs = len(key)
#Separate right vs missed questions (missed = blank and wrong answers)
wrongQInds = [qInd for qInd, ans in enumerate(resps) if ans != key[qInd]]
rightQInds = list(set(range(0,nQs)) - set(wrongQInds))
#Get blank questions
blankQInds = [qInd for qInd in wrongQInds if np.isnan(resps[qInd])] #Questions with NO answer
#Separate questions depending on whether any time spent(presumably ones left blank and then gussed on randomly)
noTimeThresh = 5
noTimeQInds = [qInd for qInd, time in enumerate(times) if time < noTimeThresh] #Questions with less than minimum time spent, so skipped in terms of effort expended
yesTimeQInds = list(set(range(0,nQs)) - set(noTimeQInds))
# Separate wrong questions based on whether time was spent on them
wrongNoTimeQInds = list(set(wrongQInds) & set(noTimeQInds))
wrongWTimeQinds = list(set(wrongQInds) - set(noTimeQInds))
#Separate questions based on checkbox and rightness
cbTotalQInds=[qInd for qInd, qChecks in enumerate(checks) if qChecks[0]]
cbPartialQInds=[qInd for qInd, qChecks in enumerate(checks) if qChecks[1]]
cbHardQInds=[qInd for qInd, qChecks in enumerate(checks) if qChecks[2]]
partialOrHardFlagged = list(set(cbTotalQInds)|set(cbHardQInds))
partialOrHardFlaggedButRight = list(set(rightQInds) & set(partialOrHardFlagged))
notPartialOrHardFlagged = list(set(range(0,nQs)) - set(partialOrHardFlagged))
notPartialOrHardFlaggedAndTimeButWrong = list(set(notPartialOrHardFlagged)& set(wrongWTimeQinds))
#Get total time spent
minsSpent = round((tEnd-tStart)/60,1)


'''
!!!***!!! NEXT STEPS:

1) Port over code to create elements of report
2) Get rid of anything from the GET DATA ELEMENTS section that not needed for current report
3) Port over Create HTML section
4) Port over Create HTML to PDF section and save in subfolder of images
5) Set to run as Chron Job and check if pdf is created
6) Update Nick
7) Need to adjust code to automatically find test assignment id based on errorlog assignment id instead of manually hardcoding as here.

'''
