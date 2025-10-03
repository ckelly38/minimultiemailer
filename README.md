# minimultiemailer
A JS that is meant to interact with GMail directly and uses the email service as well as Sheets and Drive to send emails to multiple people programatically.
The script is a bound script to this sheet. You can take the GS file and make a sheet formatted as below, then inside Google Sheets, open:
Extensions -> AppScripts -> copy this into that file.

Once the file is saved to the project, you can open the sheet and the EMAILAPP menu will appear after the HELP MENU on the COMPUTER. You cannot use your phone.
The menu has a list of items and options that you are able to do. Most of them are pretty self explanitory like SEND EMAILS actually sends it.
Some of them display what the data objects look like. Some of them include the group numbers. Some of them exclude the group numbers. Stuff like that.
There is a preview option for the final message, but it gives you the final message without formatting only text.

# The Google Sheet:
The Sheet that the script is meant to pair to looks like this:

|One for One:	|1|			NOTE: 0 means 1 email sent to everyone on the to or bcc.	
|-------------+-+-----------------------------------------------------------------------------------------------------
|Message Number to be sent: |7|		0 do not send anything. The messages start at 1.
|---------------------------+-+---------------------------------------------------------------------------------------
|Reply To: |emailaddr@domain.com|			NOTE: add a new line into the cell by hitting control enter at the spot.			
|----------+--------------------+-------------------------------------------------------------------------------------
|Include Group #s: |14|			NOTE: the group numbers must be plain text only number format (format -> numbers -> plain text).			
|------------------+--+-----------------------------------------------------------------------------------------------------
|ByPass Attachements Warning: |0|						
|-----------------------------+-+-------------------------------------------------------------------------------------
|-----------------------------+-+-------------------------------------------------------------------------------------
|Email Addresses|Names|INCLUDE?|Group #s|Attachments (if any):|Is ID 1 or Filename 0 or URL 2?|Messages           |Subjects           |
|---------------+-----+--------+--------+---------------------+-------------------------------+-------------------+-------------------+
THE DATA IN THESE CELLS
|---------------+-----+--------+--------+---------------------+-------------------------------+-------------------+-------------------+
|               |     |        |        |                     |                               |END OF MESSAGES COL|END OF SUBJECTS COL|
|---------------+-----+--------+--------+---------------------+-------------------------------+-------------------+-------------------+

# information about the sheet's formatting:
note: the picture above is only meant to give you a rough idea as to what it looks like.
If it asks for a yes or no, use: 1 or 0 only.
For everything above lines 17 The sheet is treated as if it has 3 cols with the other cells ignored. The firs col the descriptor, the second the value, the third NOTES.
Line 18 is a BLANK ROW. If you do not like this you can tweak the main data object method just above the test method at the bottom of the file.
The headers on line 19 must match or at least that must be the data you intend to store in the columns immediately below it.

The group numbers are just 14, 15, 3 for example if it has these it does something...
There must be the same number of email addresses as names and on the include col and group numbers.
The attachments if there is a blank line in between them, that is it. There are no attachments after that to the program. Same for email addresses.
There must be the same number of attachments as ID or filename desciption of it...
There must be the same number of messages as subjects however, these cells can be merged. So the END OF MESSAGES COL and END OF SUBJECTS COLs are important.
