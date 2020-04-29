#!/usr/bin/python
import smtplib
import emailConfig

def send(to,subject,message):
    user = emailConfig.user
    pwd = emailConfig.pwd
    header = 'To:' + to + '\n' + 'From: ScalisePrep.com\n' + 'Subject: '+subject+' \n'
    msg = header + '\n'+message+'\n\n'
    
    smtpserver = smtplib.SMTP("smtpout.secureserver.net",80)
    smtpserver.ehlo
    smtpserver.login(user, pwd)
    
    smtpserver.sendmail(user, to, msg)
    smtpserver.close()