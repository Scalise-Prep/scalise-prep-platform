#!/usr/bin/python
import sys, os
import json
import sendMail
print "Content-type: text/plain;charset=utf-8\n"
try:
    #extract the input variables to json
    myjson = json.load(sys.stdin)
    name=myjson["name"]
    if 'email' in myjson:
        email=myjson["email"]
    else:
        email="no email provided"
    subject=myjson["subject"]
    message=myjson["message"]
    
    import emailConfig
    to = emailConfig.to
    message='New scaliseprep.com contact form submission.\nName: ' + name + '\nEmail: ' + email + '\nSubject: ' + subject + '\nMessage: ' + message

    sendMail.send(to,subject,message)
    
    print '{"success":true}'#message sent successfully
except Exception as e:
    print(e)
    print '{"success":false}'#message send failed