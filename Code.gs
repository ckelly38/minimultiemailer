//the email addresses has a list of emails and names that correspond
//the messages column has messages that we want to send
//we only want to send one message so we need to choose the message to send
//we need to choose who is getting it (THE INCLUDE COLUMN)
//we use the who and include cols to determine what the person is named and their email address
//NOTE we will need some function to reset the include col to all zeros for all addresses
//NOTE we will also need some sort of send email function
//
//NOTE there must be the same number of names as email addresses and as on the include list 
//NOTE there must be the same number of messages as subjects
//NOTE certain columns must only have numbers
//
//Email Grouping: IE I will likely have a group of email addresses that only a certain message goes to.
//So I could say that these belong in a certain group while all the others belong in another group say
//and then just send the message to a specific group.
//The include col will of course limit who in said group gets it. Yes the include col will be a trump card.
//That gets the final say on in or out.
//But we can initially set to include those only in group or groups x, y, etc...
//
//Attachments: We can access files by the ID and by the name using the DriveApp.
//We can also attach blobs directly as they are the data type of the attachments array
//that the MailApp service uses.
//If the file is shared with a user, it is almost always better to provide the ID.
//NOTE: it will be easier to find the shared file if the email address of the owner is provided as well.
//If the file is owned by the user, then it is probably easier to use the name.
//It seems that in general it is still easier for the user to use the name.
//We need something to search for. And we need to know what it is that the user provided us with.
//What if the user provides us with a name with multiple files? I think we error out let the user know this.
//We should also error out if the file is not found.
//So 2 or 3 columns at minimum. One for the query (either file name or ID) and one for the type.
//If it is shared then the user needs to provide the email address of the owner
//which might need to be in its own column (if not then use semi-colon to split the information...)
//
//RESOURCES THAT I LOOKED AT AND FOUND SOME POSSIBLY USEFUL STUFF IN:
//
//https://developers.google.com/apps-script/guides/services/quotas
//
//https://developers.google.com/apps-script/reference/mail
//
//https://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(String,String,String,Object)
//http://developers.google.com/apps-script/reference/mail/mail-app#sendEmail(String,String,String,String)
//https://developers.google.com/apps-script/reference/mail/mail-app#getRemainingDailyQuota()
//https://developers.google.com/apps-script/samples/automations/mail-merge
//
//https://spreadsheet.dev/send-email-from-google-sheets
//
//https://webapps.stackexchange.com/questions/163587/way-to-keep-spaces-in-google-app-script-alert
//
//https://developers.google.com/apps-script/reference/drive/drive-app
//https://developers.google.com/apps-script/reference/drive
//https://developers.google.com/apps-script/advanced/drive
//
//https://developers.google.com/apps-script/reference/drive/folder
//https://developers.google.com/apps-script/reference/drive/folder#getOwner()
//https://developers.google.com/apps-script/reference/drive/user
//https://developers.google.com/apps-script/reference/drive/file
//
//https://developers.google.com/apps-script/reference/base/mime-type
//https://developers.google.com/workspace/drive/api/guides/ref-export-formats
//https://developers.google.com/workspace/drive/api/reference/rest/v3/files/export
//
//https://spreadsheet.dev/comprehensive-guide-export-google-sheets-to-pdf-excel-csv-apps-script
//
//DriveApp.getRootFolder().getOwner().getEmail();//gets the email address of the user
//Session.getActiveUser().getEmail();//gets the email address of the user

const myalerterrs = true;

function isValUndefinedOrNull(val) { return (val === undefined || val === null); }
function isValNullOrUndefined(val) { return this.isValUndefinedOrNull(val); }
function isValEmptyNullOrUndefined(val) { return (this.isValUndefinedOrNull(val) || val.length < 1); }

//NOTE: DEPENDS ON JSON JAVASCRIPT LIBRARY
function myGenObjToStr(mobj)
{
  if (this.isValUndefinedOrNull(mobj)) return "null";
  if (typeof(mobj) === "object");
  else return "" + mobj;
  const mkys = Object.keys(mobj);
  //const mvals = Object.values(mobj);
  const myjsonstr = JSON.stringify(mobj);
  const kystris = mkys.map((mky) => myjsonstr.indexOf("\"" + mky + "\":"));
  console.log("mkys = ", mkys);
  //console.log("mvals = ", mvals);
  console.log("myjsonstr = " + myjsonstr);
  console.log("kystris = ", kystris);
  
  let mstr = "";
  let kindx = kystris.length - 1;
  if (kystris.length < 1) return "" + myjsonstr; 
  for (let i = myjsonstr.length - 1; i < myjsonstr.length && -1 < i; i--)
  {
    if (kindx < 0 || kystris.length - 1 < kindx)
    {
      //throw new Error("illegal negative index used here for kindx!");
      this.throwAndOrAlertTheError(myalerterrs, "illegal negative index used here for kindx!");
    }

    if (i === kystris[kindx])
    {
      if (kindx === 0)
      {
        let clni = mstr.indexOf(":");
        mstr = myjsonstr.substring(0, i + 1) + mstr.substring(0, clni) + ": " + mstr.substring(clni + 1);
        kindx--;
        break;
      }
      else if (0 < kindx)
      {
        mstr = "\n" + myjsonstr[i] + mstr;
        let clni = mstr.indexOf(":");
        mstr = mstr.substring(0, clni) + ": " + mstr.substring(clni + 1);
      }
      else
      {
        //throw new Error("illegal negative index used here for kindx!");
        this.throwAndOrAlertTheError(myalerterrs, "illegal negative index used here for kindx!");
      }
      kindx--;
    }
    else mstr = "" + myjsonstr[i] + mstr;
  }
  console.log("mstr = " + mstr);
  return mstr;
}

function alertResultsToUser(msgorobj)
{
  console.log("msgorobj = ", msgorobj);
  
  const mobjstr = this.myGenObjToStr(msgorobj); 
  console.log(mobjstr);
  //debugger;
  //note alert does not preseve the spacing so use a non-breaking space thanks damn Google
  //note alert also does not like the -s so use a non-breaking - as well
  //https://webapps.stackexchange.com/questions/163587/way-to-keep-spaces-in-google-app-script-alert
  SpreadsheetApp.getUi().alert(mobjstr.replace(/ /g,'\xa0').replace(/-/g, '\u2011'));
}
function throwAndOrAlertTheError(usealert, errobj)
{
  console.log("inside throw and or alert the error!");
  console.error(errobj);
  const objnoiserr = this.isValNullOrUndefined(errobj.stack);
  if (objnoiserr);
  else console.error(errobj.stack);
  if (this.isValEmptyNullOrUndefined(errobj)) throw new Error("the error message must not be empty!");
  if (usealert) this.alertResultsToUser((objnoiserr ? errobj : errobj.stack));
  throw new Error((objnoiserr ? errobj : errobj.stack));
}
function throwAndAlertTheError(errmsg) { return this.throwAndOrAlertTheError(true, errmsg); }
function throwTheErrorOnly(errmsg) { return this.throwAndOrAlertTheError(false, errmsg); }

function letMustBeDefined(val, varnm="varnm")
{
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letMustBeDefined(val, "varnm");
  //else;//do nothing
  if (this.isValUndefinedOrNull(val))
  {
    //throw new Error("" + varnm + " must be defined, but it was not!");
    this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must be defined, but it was not!");
  }
  else return true;
}
function letMustBeBoolean(val, varnm="varnm")
{
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letMustBeBoolean(val, "varnm");
  //else;//do nothing
  if (val === true || val === false) return true;
  else
  {
    //throw new Error("" + varnm + " must be boolean, but it was not!");
    this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must be boolean, but it was not!");
  }
}
function letMustBeOrNotBeEmpty(val, noempty, varnm="varnm")
{
  this.letMustBeBoolean(noempty, "noempty");
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letMustBeOrNotBeEmpty(val, noempty, "varnm");
  //else;//do nothing

  if (noempty)
  {
    if (this.isValEmptyNullOrUndefined(val))
    {
      //throw new Error("" + varnm + " must not be empty, but it was!");
      this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must not be empty, but it was!");
    }
    else return true;
  }
  else
  {
    if (this.isValEmptyNullOrUndefined(val)) return true;
    else
    {
      //throw new Error("" + varnm + " must not empty, but it was not!");
      this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must not empty, but it was not!");
    }
  }
}
function letMustBeEmpty(val, varnm="varnm") { return this.letMustBeOrNotBeEmpty(val, false, varnm); }
function letMustNotBeEmpty(val, varnm="varnm") { return this.letMustBeOrNotBeEmpty(val, true, varnm); }

function myIsDigit(mc)
{
  this.letMustNotBeEmpty(mc, "mc");
  return (mc === '0' || mc === '1' || mc === '2' || mc === '3' || mc === '4' || mc === '5' || mc === '6' ||
    mc === '7' || mc === '8' || mc === '9');
}
function isValANumber(val)
{
  this.letMustNotBeEmpty(val, "val");
  const mynumstr = "" + val;
  let decfnd = false;
  for (let i = 0; i < mynumstr.length; i++)
  {
    if (this.myIsDigit(mynumstr[i]));
    else if (mynumstr[i] === '-' && i === 0);
    else if (mynumstr[i] === '.' && !decfnd) decfnd = true;
    else return false;
  }
  return true;
}
//is val a number, but has no decimal point with it. 1 -> true; 1.0 -> false
function isValAnInteger(val)
{
  if (this.isValANumber(val))
  {
    const mvalstr = "" + val;
    const mdci = mvalstr.indexOf(".");
    return (mdci < 0 || mvalstr.length - 1 < mdci);
  }
  else return false;
}
function isValADecimal(val) { return (this.isValANumber(val) ? (!(this.isValAnInteger(val))) : false); }

function letMustBeAnIntegerOrDecimal(val, intonly, varnm="varnm")
{
  this.letMustBeBoolean(intonly, "intonly");
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letMustBeAnIntegerOrDecimal(val, intonly, "varnm");
  //else;//do nothing
  
  if (this.isValANumber(val))
  {
    if (intonly)
    {
      const mvalstr = "" + val;
      const mdci = mvalstr.indexOf(".");
      if (mdci < 0 || mvalstr.length - 1 < mdci) return true;
      else
      {
        //throw new Error("" + varnm + " must be an integer only, but it was not!");
        this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must be an integer only, but it was not!");
      }
    }
    return true;
  }
  else
  {
    //throw new Error("" + varnm + " must be a number, but it was not!");
    this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must be a number, but it was not!");
  }
}
function letMustBeAnIntegerOnly(val, varnm="varnm") { return this.letMustBeAnIntegerOrDecimal(val, true, varnm); }
function letMustBeADecimal(val, varnm="varnm") { return this.letMustBeAnIntegerOrDecimal(val, false, varnm); }

function getBoolValFromNumber(val)
{
  this.letMustBeAnIntegerOnly(val, "num");
  return (Number("" + val) !== 0);
}

function getMyUpperLetters()
{
  return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z"];
}
function getMyLowerLetters()
{
  return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"];
}
function getAllMyLetters()
{
  let myltrs = this.getMyUpperLetters().map((ltr) => "" + ltr);
  this.getMyLowerLetters().forEach((ltr) => myltrs.push("" + ltr));
  return myltrs;
}
function myCharIsOnList(mc, myltrs)
{
  this.letMustNotBeEmpty(mc, "mc");
  if (mc.length === 1);
  else
  {
    //throw new Error("mc must be a character or string of length 1, but it was not!");
    this.throwAndOrAlertTheError(myalerterrs, "mc must be a character or string of length 1, but it was not!");
  }
  for (let i = 0; i < myltrs.length; i++) if (mc === myltrs[i]) return true;
  return false;
}
function myIsAlpha(mc) { return this.myCharIsOnList(mc, this.getAllMyLetters()); }
function myIsUpperOrIsLower(mc, useupper)
{
  this.letMustBeBoolean(useupper, "useupper");
  const mltrs = (useupper ? this.getMyUpperLetters() : this.getMyLowerLetters());
  return this.myCharIsOnList(mc, mltrs);
}
function myIsUpper(mc) { return this.myIsUpperOrIsLower(mc, true); }
function myIsLower(mc) { return this.myIsUpperOrIsLower(mc, false); }
function myIsUpperOrLowerCaseWord(wd, useupper)
{
  this.letMustBeBoolean(useupper, "useupper");
  if (this.isValEmptyNullOrUndefined(wd)) return false;
  const mynwwd = (useupper ? wd.toUpperCase(): wd.toLowerCase());
  return (mynwwd === wd);
}
function myIsLowerCaseWord(wd) { return this.myIsUpperOrLowerCaseWord(wd, false); }
function myIsUpperCaseWord(wd) { return this.myIsUpperOrLowerCaseWord(wd, true); }


function isTextValidAOneNotation(mstr)
{
  //maxnumcols is ZZZ
  //maxnumrows is a fixed number but it is really really big so just accept anything
  //once a number is found it can only be numbers
  //no negatives and no decimals either
  this.letMustNotBeEmpty(mstr, "mstr");
  let numltrs = 0;
  for (let i = 0; i < mstr.length; i++)
  {
    if (this.myIsDigit(mstr[i]))
    {
      //num starts here...
      if (numltrs < 1) return false;
      const mysubstr = mstr.substring(i);
      this.letMustBeAnIntegerOnly(mysubstr, "mysubstr");
      break;
    }
    else if (this.myIsUpper(mstr[i]))
    {
      numltrs++;
      if (3 < numltrs) return false;
    }
    else return false;
  }
  return true;
}

function letMustBeValidAOneNotation(val, varnm="varnm")
{
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letMustBeValidAOneNotation(val, "varnm");
  if (this.isTextValidAOneNotation(val)) return true;
  else
  {
    //throw new Error("" + varnm + " must be valid a1 notation, but it was not!");
    this.throwAndOrAlertTheError(myalerterrs, "" + varnm + " must be valid a1 notation, but it was not!");
  }
}

function areAllItemsOfArrAInArrB(lista, listb)
{
  if (this.isValEmptyNullOrUndefined(listb)) return this.isValEmptyNullOrUndefined(lista);
  else
  {
    if (this.isValEmptyNullOrUndefined(lista)) return false;
    //else;//do nothing proceed below
  }

  for (let i = 0; i < lista.length; i++)
  {
    let fnd = false;
    for (let k = 0; k < listb.length; k++)
    {
      if (this.isValEmptyNullOrUndefined(listb[k]))
      {
        if (this.isValEmptyNullOrUndefined(lista[i]))
        {
          fnd = true;
          break;
        }
        //else continue;
      }
      else
      {
        if (this.isValEmptyNullOrUndefined(lista[i]));
        else
        {
          if (listb[k] === lista[i])
          {
            fnd = true;
            break;
          }
        }
      }
    }
    if (fnd);
    else return false;
  }
  return true;
}

function letObjMustHaveTheseKeys(mobj, mkys, varnm="varnm")
{
  if (this.isValEmptyNullOrUndefined(varnm)) return this.letObjMustHaveTheseKeys(mobj, mkys, "mobj");

  const merrmsg = "" + varnm + " object must have the following keys: " + mkys.join(", ") + " but it did not!";
  if (this.isValNullOrUndefined(mobj))
  {
    if (isValEmptyNullOrUndefined(mkys)) return true;
    else this.letMustBeDefined(mobj, varnm);
  }

  if (this.areAllItemsOfArrAInArrB(mkys, Object.keys(mobj))) return true;
  else
  {
    //throw new Error(merrmsg);
    this.throwAndOrAlertTheError(myalerterrs, merrmsg);
  }
}

function combineTwoLists(lista, listb, nodups=true)
{
  this.letMustBeBoolean(nodups, "nodups");
  if (this.isValEmptyNullOrUndefined(lista)) return listb;
  if (this.isValEmptyNullOrUndefined(listb)) return lista;
  let reslist = [];
  for (let n = 0; n < 2; n++)
  {
    let mlist = ((n === 0) ? lista : listb);
    for (let i = 0; i < mlist.length; i++)
    {
      let addit = true;
      if (nodups)
      {
        for (let k = 0; k < reslist.length; k++)
        {
          if (mlist[i] === reslist[k])
          {
            addit = false;
            break;
          }
        }//end of k for loop
      }
      if (addit) reslist.push(mlist[i]);
    }//end of i for loop
  }//end of n for loop
  return reslist;
}

function convertATwoDStringArrayToAOneDStringArray(mtwdstrarr, nodups=true)
{
  this.letMustBeBoolean(nodups, "nodups");
  if (this.isValNullOrUndefined(mtwdstrarr)) return null;
  else if (mtwdstrarr.length < 1) return [];
  else
  {
    //[[wds...], [wds...], [wds...], [], [""], null] to:
    //[wds..., wds..., wds..., "", null]
    let myresarr = [];
    mtwdstrarr.forEach((wdlist) => {
      if (this.isValEmptyNullOrUndefined(wdlist));
      else
      {
        wdlist.forEach((wd) => {
          if (this.isValNullOrUndefined(wd))
          {
            let addit = true;
            if (nodups)
            {
              for (let i = 0; i < myresarr.length; i++)
              {
                if (this.isValNullOrUndefined(myresarr[i]))
                {
                  addit = false;
                  break;
                }
              }
            }
            
            if (addit) myresarr.push(null);
          }
          else
          {
            let addit = true;
            if (nodups)
            {
              for (let i = 0; i < myresarr.length; i++)
              {
                if (this.isValNullOrUndefined(myresarr[i]));
                else if (myresarr[i] === wd)
                {
                  addit = false;
                  break;
                }
              }
            }
            
            if (addit) myresarr.push("" + wd);
          }
        });
      }
    });
    return myresarr;
  }
}
function flattenATwoDArrayToAOneDArray(mtwdstrarr, nodups=true)
{
  return this.convertATwoDStringArrayToAOneDStringArray(mtwdstrarr, nodups);
}

function twoWordComboGen(wda, wdb)
{
  this.letMustNotBeEmpty(wda, "wda");
  this.letMustNotBeEmpty(wdb, "wdb");
  const mdelims = ["", "-", "_"];
  const minitwds = mdelims.map((mdstr) => wda + mdstr + wdb);//[wdawdb, wda-wdb, wda_wdb]
  let finwds = [];
  minitwds.forEach((fwd) => finwds.push(fwd));
  minitwds.forEach((fwd) => finwds.push(fwd.toUpperCase()));
  //above makes: [wdawdb, wda-wdb, wda_wdb, WDAWDB, WDA-WDB, WDA_WDB]
  //minitwds.forEach((fwd) => {
  //  finwds.push(fwd);
  //  finwds.push(fwd.toUpperCase());
  //});//[wdawdb, WDAWDB, wda-wdb, WDA-WDB, wda_wdb, WDA_WDB]
  return finwds;
}

function genLowerSnakeUpperWords(wds)
{
  if (this.isValEmptyNullOrUndefined(wds)) return [];
  const mylwrwds = wds.map((wd) => (this.myIsLowerCaseWord(wd) ? "" + wd : wd.toLowerCase()));
  const myfinwds = mylwrwds.map((wd) => {
    if (this.isValNullOrUndefined(wd)) return [null];
    else if (wd.length < 1) return [""];
    else return ["" + wd, wd.charAt(0).toUpperCase() + (1 < wd.length ? wd.substring(1) : ""), wd.toUpperCase()];
  });
  return myfinwds;
}
function genAndFlattenLowerSnakeUpperWords(wds)
{
  return this.convertATwoDStringArrayToAOneDStringArray(this.genLowerSnakeUpperWords(wds), true);
}
function genAndFlattenAMapOfTwoWordCombos(marr, oitem, nodups=true)
{
  this.letMustBeBoolean(nodups, "nodups");
  if (this.isValUndefinedOrNull(marr)) return null;
  else if (marr.length < 1) return [];
  return this.flattenATwoDArrayToAOneDArray(marr.map((addrwd) => this.twoWordComboGen(oitem, addrwd)), nodups);
}


function getAllIndexesOf(ptstr, mstr, offset=0)
{
  this.letMustBeAnIntegerOnly(offset, "offset");
  if (offset < 0) throw new Error("offset must be at least zero!");
  //console.log("offset = " + offset);
  //console.log("ptstr = " + ptstr);
  //console.log("mstr = " + mstr);

  if (this.isValEmptyNullOrUndefined(mstr)) return ((this.isValEmptyNullOrUndefined(ptstr)) ? [offset] : [-1]);
  else
  {
    if (this.isValEmptyNullOrUndefined(ptstr)) return [-1];
    else if (ptstr === mstr) return [offset];
    //else;//do nothing safe to proceed below...
  }

  const mi = mstr.indexOf(ptstr);
  //console.log("mi = " + mi);

  if (mi < 0 || mstr.length - 1 < mi) return [-1];
  
  //else take the index + offset
  //dear so and so something happened...
  //0123456789012345678901234567890123456
  //0         1         2         3
  //for word so: 5, 12, 15
  //after mi strip the string and repeat
  //dear so
  //next string space and so space....
  //next string space something happened...
  //if the list has -1s on it then ignore them unless that is it.

  //console.log("MAKING THE RECURSIVE CALL HERE NOW:");

  const myretlist = this.getAllIndexesOf(ptstr, mstr.substring(mi + ptstr.length), mi + ptstr.length + offset);
  const finretlist = [mi + offset];
  myretlist.forEach((item) => {
    if (item < 0);
    else finretlist.push(item);
  });
  //console.log("AFTER THE RECURSIVE CALL:");
  //console.log("mi = " + mi);
  //console.log("offset = " + offset);
  //console.log("ptstr = " + ptstr);
  //console.log("mstr = " + mstr);
  //console.log("myretlist = ", myretlist);
  //console.log("finretlist = ", finretlist);

  return finretlist;
}


//this method splits the string at certain delimeter indexes and adds a length for each index
//the length can be 0 for just split at the index, but no ignore characters
//the length should not be negative...
//const mystrs = this.mySplit(mstr, delimis, delimlens);
//const mystrs = this.mySplitWithLen(mstr, delimis, delimlen);
//const mystrs = this.mySplitWithDelim(mstr, delimstr);
function mySplit(mstr, delimis, delimlens, remestrs=true)
{
  //console.log("inside of mySplit():");
  //console.log("mstr = " + mstr);
  //console.log("delimis = ", delimis);
  //console.log("delimlens = ", delimlens);
  //console.log("remestrs = " + remestrs);

  this.letMustBeBoolean(remestrs, "remestrs");
  if (this.isValEmptyNullOrUndefined(mstr)) return [""];
  if (this.isValEmptyNullOrUndefined(delimis) === this.isValEmptyNullOrUndefined(delimlens))
  {
    if (this.isValEmptyNullOrUndefined(delimis)) return [mstr];
    else
    {
      if (delimis.length === delimlens.length)
      {
        //the indexes must be valid
        //the lengths must be valid
        for (let i = 0; i < delimis.length; i++)
        {
          if (delimis[i] < 0 || mstr.length - 1 < delimis[i])
          {
            throw new Error("the delimiter indexes must be valid, they must be in the string " +
              "length from 0 to the string length, but not including it!");
          }
          //else;//do nothing
          if (delimlens[i] < 0 || mstr.length - 1 < delimlens[i])
          {
            throw new Error("the delimiter lengths must be valid, they must be in the string " +
              "length from 0 to the string length, but not including it!");
          }
          //else;//do nothing
        }//end of i for loop
      }
      else throw new Error("delimis and delimlens lengths must both be the same!");
    }
  }
  else throw new Error("delimis and delimlens emptiness must both be the same!");
  
  //the index + the length must be less than or equal to the next index
  const errmsga = "the indexes and the lengths must be less than or equal to the next index, but they were not!";
  for (let i = 1; i < delimis.length; i++)
  {
   if (delimis[i] < delimis[i - 1] + delimlens[i - 1]) throw new Error(errmsga);
   //else;//do nothing
  }

  //the data seems to be valid...
  let mstrs = [];
  for (let i = 0; i < delimis.length; i++)
  {
    //at the first one we add two strings...
    //at the others we add one string...
    //at the last one we add the last string...
    if (i < 1)
    {
      if (i < 0) throw new Error("illegal negative index used here for index i!");
      else mstrs.push(mstr.substring(0, delimis[0]));//the first string
    }
    else mstrs.push(mstr.substring(delimis[i - 1] + delimlens[i - 1], delimis[i]));
  }//end of i for loop
  mstrs.push(mstr.substring(delimis[delimis.length - 1] + delimlens[delimis.length - 1]));//the last string
  //console.log("   mstrs = ", mstrs);

  if (remestrs);
  else return mstrs;

  const finmstrs = mstrs.filter((mstr, mi) => (0 < mstr.length));//if true keep it
  //console.log("finmstrs = ", finmstrs);

  return finmstrs;
}
function mySplitWithLen(mstr, delimis, delimlen, remestrs=true)
{
  this.letMustBeAnIntegerOnly(delimlen);
  this.letMustBeBoolean(remestrs, "remestrs");
  if (delimlen < 0) throw new Error("delimlen is not allowed to be negative!");
  if (this.isValEmptyNullOrUndefined(mstr)) return [""];
  this.letMustNotBeEmpty(delimis);
  const delimlens = delimis.map((mval) => delimlen);
  return this.mySplit(mstr, delimis, delimlens, remestrs);
}
function mySplitWithDelim(mstr, delimstr, remestrs=true)
{
  this.letMustBeBoolean(remestrs, "remestrs");
  if (this.isValEmptyNullOrUndefined(mstr)) return [""];
  else if (this.isValEmptyNullOrUndefined(delimstr)) return mstr.split("");   
  //else return this.mySplitWithLen(mstr, this.getAllIndexesOf(delimstr, mstr, 0), delimstr.length, remestrs);
  else return mstr.split(delimstr);
}


const ss = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];//gets the first spreadsheet;
let mydata = ss.getDataRange().getValues();
let mxrow = mydata.length;
let mxcol = mydata[0].length;

function setMyDataArrVars(valarr)
{
  mydata = valarr;
  if (this.isValUndefinedOrNull(valarr))
  {
    mxrow = -1;
    mxcol = -1;
  }
  else
  {
    mxrow = valarr.length;
    if (mxrow < 1 || this.isValUndefinedOrNull(valarr[0])) mxcol = -1;
    else mxcol = valarr[0].length;
  }
}

/** 
 * Creates the menu for the user to run scripts on drop-down.
 */
//NOTE THE FUNCTIONS CALLED BY THE MENU MUST NOT HAVE ANY PARAMETERS AND ANY PARAMETERS NEEDED MUST BE
//EASILY OBTAINED FROM THE SPREADSHEET OR FROM SOME DB QUICKLY
//OR THE USER MUST BE ABLE TO ENTER THEM IN SOME CUSTOM ALERT AND THEN THE DATA EXTRACTED FROM SAID ALERT.
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('MyEMailAppMenu')
      .addItem('Test', 'myTestFunction')
      .addItem('getDailyQuotaLimit', 'getQuotaLimitForTheUser')
      .addItem('IncludeNone', 'resetIncludeColMain')
      .addItem('IncludeAll', 'includeAllMain')
      //.addItem('IncludeGroupNumbers', 'includeCertainGroupNumbersOnIncColFromDatObjAndSheetMain')
      //.addItem('ExcludeGroupNumbers', 'excludeCertainGroupNumbersOnIncColFromDatObjAndSheetMain')
      .addItem('IncludeGroupNumbersOnly', 'includeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheetMain')
      .addItem('IncludeGroupNumbersAdd', 'includeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheetMain')
      .addItem('ExcludeGroupNumbersOnly', 'excludeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheetMain')
      //.addItem('ExcludeGroupNumbersAdd', 'excludeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheetMain')
      .addItem('MessageRowDataInfoObj', 'getForUserMyMessageRowDataObject')
      .addItem('getSpreadSheetHeaderDataInfoObj', 'getMyDataInfoObjConstsForUser')
      .addItem('isDataValid', 'getForUserIsValidData')
      .addItem('canSendAMessage', 'canUserSendAMessage')
      .addItem('userCanSendMesageAndIsValidData', 'userCanSendAMessageAndIsValidData')
      .addItem('get final message with testname', 'getMyFinalMessageFromSheetWithTestNameForUser')
      .addItem('get final subject with testname', 'getMyFinalSubjectFromSheetWithTestNameForUser')
      .addItem('Send Emails', 'sendTheMessageFromTheSheetForAllRowsMain')
      .addItem('Include Only Group Nums And Send', 'includeAndOnlySendToTheGroupNumbersMain')// The Emails
      .addItem('Add Group Nums And Send The Emails', 'includeAndAddGroupNumbersAndSendItMain')
      .addToUi();
}

function getQuotaLimitForTheUser() { this.alertResultsToUser(MailApp.getRemainingDailyQuota()); }

function getTheMaxValidRowIndex(ci, myhdrwi, mymsgscoli)
{
  this.letMustBeAnIntegerOnly(mymsgscoli, "mymsgscoli");
  this.letMustBeAnIntegerOnly(myhdrwi, "myhdrwi");
  this.letMustBeAnIntegerOnly(ci, "ci");
  const errmsga = "the col indexs must be at least zero and less than the max col, but it was not!";
  const errmsgb = "the header row index must be at least zero and less than the max row, but it was not!";
  const errmsgc = "the end of col row index must be at least zero and less than the max row, but it was not!";
  if ((ci < 0 || mxcol - 1 < ci) || (mymsgscoli < 0 || mxcol - 1 < mymsgscoli))
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsga);
  }
  if (myhdrwi < 0 || mxrow - 1 < myhdrwi)
  {
    //throw new Error(errmsgb);
    this.throwAndOrAlertTheError(myalerterrs, errmsgb);
  }
  if (ci < mymsgscoli)
  {
    if (ci < 0) throw new Error("it should not have made it here. Illegal negative value for index ci found!");
    for (let r = myhdrwi + 1; r < mxrow; r++)
    {
      if (this.isValEmptyNullOrUndefined(mydata[r][ci]))
      {
        if (r === myhdrwi + 1) return -1;
        else
        {
          return r - 1;//right for email cols and those that must have same as those
          //but the messages and subjects and those often require merging of cells for them to fit
          //so this is wrong for those cols...
        }
      }
      else
      {
        if (r + 1 < mxrow);
        else if (r + 1 === mxrow) return r;
        else break;
      }
    }//end of r for loop
  }
  else
  {
    //get end of ... col row index and then work backwards
    const eofclstr = "END OF " + mydata[myhdrwi][ci].toUpperCase() + " COL";
    const lwreofclstr = eofclstr.toLowerCase();
    let eoclrwi = -1;
    for (let r = myhdrwi + 1; r < mxrow; r++)
    {
      if (mydata[r][ci] === eofclstr || mydata[r][ci] === lwreofclstr)
      {
        eoclrwi = r;
        break;
      }
      //else;//do nothing
    }
    //console.log("eofclstr = " + eofclstr);
    //console.log("eoclrwi = " + eoclrwi);

    if (eoclrwi < 0 || mxrow - 1 < eoclrwi)
    {
      //throw new Error(errmsgc);
      this.throwAndOrAlertTheError(myalerterrs, errmsgc);
    }
    //else;//do nothing safe to proceed

    for (let r = eoclrwi - 1; -1 < r && myhdrwi < r && r < mxrow; r--)
    {
      if (this.isValEmptyNullOrUndefined(mydata[r][ci]));
      else return r;
    }
    //console.log("DID NOT FIND WHAT WE WERE LOOKING FOR RETURNING -1!");
  }
  return -1;
}
function getTheMaxValidRowIndexViaDatObj(ci, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getTheMaxValidRowIndex(ci, mdatobj[rkys[0]], mdatobj[rkys[1]]);
}
function getTheMaxValidRowIndexMain(ci)
{
  return this.getTheMaxValidRowIndexViaDatObj(ci, this.getMyDataInfoObjConsts());
}


//set include col to 1 or 0 methods section here:

function setMyColValsToZeroOrOne(ci, hdrwi, useone=false)
{
  this.letMustBeBoolean(useone, "useone");
  this.letMustBeAnIntegerOnly(ci, "ci");
  this.letMustBeAnIntegerOnly(hdrwi, "hdrwi");
  const errmsga = "the indexes inccoli and hdrwi must both be at least zero, and the rows must be less than " +
    "the max row and the cols must be less than the max col!";
  if ((ci < 0 || mxcol - 1 < ci) || (hdrwi < 0 || mxrow - 1 < hdrwi))
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsga);
  }
  //else;//do nothing
  console.log("mxrow = " + mxrow);
  console.log("mxcol = " + mxcol);
  //console.log("mydata = ", mydata);

  //prints the data
  const pdat = false;
  if (pdat)
  {
    for (let r = 0; r < mxrow; r++)
    {
      for (let c = 0; c < mxcol; c++)
      {
        console.log(ss.getRange(r + 1, c + 1).getA1Notation());
        console.log("mydata[" + r + "][" + c + "] = ", mydata[r][c]);
      }
    }
  }
  //else;//do nothing

  const mxrwvi = this.getTheMaxValidRowIndexMain(ci);
  console.log("ci = " + ci);
  console.log("mxrwvi = " + mxrwvi);

  //set the values here...
  const msga = (useone ? "" : "RE") + "SETTING THE VALUE AT: ";
  const msgb = "THE COL WAS " + (useone ? "" : "RE") + "SET SUCCESSFULLY!";
  for (let r = hdrwi + 1; r < mxrwvi + 1 && r < mxrow; r++)
  {
    console.log("BEGIN " + msga + ss.getRange(r + 1, ci + 1).getA1Notation());
    ss.getRange(r + 1, ci + 1).setValue((useone ? 1 : 0));
    console.log("DONE " + msga + ss.getRange(r + 1, ci + 1).getA1Notation());
  }
  console.log(msgb);
  
  //refetch the data array here because the data changed above and
  //if other functions use it as is they use old data and error out...
  this.setMyDataArrVars(ss.getDataRange().getValues());

  return true;
}
function setMyColValsToZero(ci, hdrwi) { return this.setMyColValsToZeroOrOne(ci, hdrwi, false); }
function setMyColValsToOne(ci, hdrwi) { return this.setMyColValsToZeroOrOne(ci, hdrwi, true); }

function resetMyCol(ci, hdrwi) { return this.setMyColValsToZero(ci, hdrwi); }
function includeAllOrResetColViaDataObj(useset, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["inccoli", "mnhdri"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  if (useset) return this.setMyColValsToOne(mdatobj[rkys[0]], mdatobj[rkys[1]]);
  else return this.resetMyCol(mdatobj[rkys[0]], mdatobj[rkys[1]]);
}
function resetIncludeColMain()
{
  return this.includeAllOrResetColViaDataObj(false, this.getMyDataInfoObjConsts());
}
function includeNoneMain() { return this.resetIncludeColMain(); }
function includeAllMain() { return this.includeAllOrResetColViaDataObj(true, this.getMyDataInfoObjConsts()); }


//add or include only certain group numbers methods

function getGroupNumbersStringFromDatObj(mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["incgrpnumscell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return ss.getRange(mdatobj[rkys[0]]).getValue();
}
function getGroupNumbersStringFromDatObjMain()
{
  return this.getGroupNumbersStringFromDatObj(this.getMyDataInfoObjConsts());
}


function inOrExcludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, useonly, useone=true)
{
  this.letMustBeBoolean(useone, "useone");
  this.letMustBeBoolean(useonly, "useonly");
  this.letMustBeAnIntegerOnly(ci, "ci");
  this.letMustBeAnIntegerOnly(mygpcoli, "mygpcoli");
  this.letMustBeAnIntegerOnly(hdrwi, "hdrwi");
  const errmsga = "the indexes inccoli, mygpcoli and hdrwi must both be at least zero, and the rows " +
    "must be less than the max row and the cols must be less than the max col!";
  if ((ci < 0 || mxcol - 1 < ci) || (mygpcoli < 0 || mxcol - 1 < mygpcoli) || (hdrwi < 0 || mxrow - 1 < hdrwi))
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsga);
  }
  //else;//do nothing
  console.log("mxrow = " + mxrow);
  console.log("mxcol = " + mxcol);
  //console.log("mydata = ", mydata);

  //prints the data
  const pdat = false;
  if (pdat)
  {
    for (let r = 0; r < mxrow; r++)
    {
      for (let c = 0; c < mxcol; c++)
      {
        console.log(ss.getRange(r + 1, c + 1).getA1Notation());
        console.log("mydata[" + r + "][" + c + "] = ", mydata[r][c]);
      }
    }
  }
  //else;//do nothing

  const mxrwvi = this.getTheMaxValidRowIndexMain(ci);
  console.log("ci = " + ci);
  console.log("mxrwvi = " + mxrwvi);
  console.log("gpstr = " + gpstr);
  
  const msgb = "THE COL WAS " + (useone ? "" : "RE") + "SET SUCCESSFULLY!";
  const invgpnumerrmsg = "the group number must be valid, but it was not!";
  if (this.isValEmptyNullOrUndefined(gpstr))
  {
    console.log(msgb);
    return true;
  }

  if (this.areGroupNumbersValid(gpstr, true));
  else
  {
    //throw new Error(invgpnumerrmsg);
    this.throwAndOrAlertTheError(myalerterrs, invgpnumerrmsg);
  }
  
  
  const mygpnumstrs = gpstr.split(", ");
  console.log("mygpnumstrs = ", mygpnumstrs);
  console.log("useone = " + useone);
  console.log("useonly = " + useonly);

  //set the values here...
  const msga = (useone ? "" : "RE") + "SETTING THE VALUE AT: ";
  for (let r = hdrwi + 1; r < mxrwvi + 1 && r < mxrow; r++)
  {
    console.log("BEGIN " + msga + ss.getRange(r + 1, ci + 1).getA1Notation());
    console.log("(inci) mydata[" + r + "][" + ci + "] = " + mydata[r][ci]);
    console.log("(gpnm) mydata[" + r + "][" + mygpcoli + "] = " + mydata[r][mygpcoli]);
    if (this.areGroupNumbersValid(mydata[r][mygpcoli], false));
    else
    {
      //throw new Error(invgpnumerrmsg);
      this.throwAndOrAlertTheError(myalerterrs, invgpnumerrmsg);
    }
    let mytmprwgpnumstr = "" + mydata[r][mygpcoli];
    let mytmprwgpnumstrs = mytmprwgpnumstr.split(", ");
    //let mynums = mytmprwgpnumstrs.map((numstr) => Number(numstr));
    console.log("mytmprwgpnumstrs = ", mytmprwgpnumstrs);
    //console.log("mynums = ", mynums);

    let mysetit = false;//this variable holds the same value as the breakouter in this case
    for (let n = 0; n < mytmprwgpnumstrs.length; n++)
    {
      for (let k = 0; k < mygpnumstrs.length; k++)
      {
        console.log("mygpnumstrs[" + k + "] = " + mygpnumstrs[k]);
        console.log("mytmprwgpnumstrs[" + n + "] = " + mytmprwgpnumstrs[n]);

        if (mygpnumstrs[k] === mytmprwgpnumstrs[n])
        {
          console.log("FOUND ONE THAT WE WANT!");
          mysetit = true;
          break;
        }
      }//end of k for loop
      if (mysetit) break;
    }//end of n for loop

    //if mysetit = true we include or exclude it
    //if mysetit = false and use add do nothing, but if using only: then set to if include 0 if exclude ?
    //when exclude is true, we want to exclude them (useone is false);
    //when exclude is false, we want to include them (useone is true)
    
    //if we want to exclude the numbers that do match, what about those that don't?
    //do we include them? or do nothing? we will do nothing.

    //if the group numbers do match (IE we are setting it):
    //-set to whatever include or exclude regardless of using only or using add
    //if not setting the value meaning if the group numbers do not match,
    //-if using add, then: do nothing
    //-if using only (strict match, but no match), then:
    //--if using include: 0
    //--if using exclude: do nothing
    if (mysetit) ss.getRange(r + 1, ci + 1).setValue((useone ? 1 : 0));
    else if (useonly && useone) ss.getRange(r + 1, ci + 1).setValue(0);
    console.log("DONE " + msga + ss.getRange(r + 1, ci + 1).getA1Notation());
  }//end of r for loop
  console.log(msgb);
  
  //refetch the data array here because the data changed above and
  //if other functions use it as is they use old data and error out...
  this.setMyDataArrVars(ss.getDataRange().getValues());

  return true;
}
function onlyInOrExcludeCertainGroupNumbers(gpstr, ci, mygpcoli, hdrwi, useone)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, true, useone);
}
function addInOrExcludeCertainGroupNumbers(gpstr, ci, mygpcoli, hdrwi, useone)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, false, useone);
}

function includeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, useonly, true);
}
function includeCertainGroupNumbersOnly(gpstr, ci, mygpcoli, hdrwi)
{
  return this.includeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, true);
}
function includeAndAddCertainGroupNumbers(gpstr, ci, mygpcoli, hdrwi)
{
  return this.includeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, false);
}
function excludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, useonly, false);
}
function excludeCertainGroupNumbersOnly(gpstr, ci, mygpcoli, hdrwi)
{
  return this.excludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, true);
}
function excludeCertainGroupNumbersOnAdd(gpstr, ci, mygpcoli, hdrwi)
{
  return this.excludeCertainGroupNumbersOnlyOrNot(gpstr, ci, mygpcoli, hdrwi, false);
}


function inOrExcludeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, useonly, useone=true)
{
  this.letMustBeValidAOneNotation(gpcellstr, "gpcellstr");
  return this.inOrExcludeCertainGroupNumbersOnlyOrNot(ss.getRange(gpcellstr).getValue(), ci, mygpcoli, hdrwi,
    useonly, useone);
}
function includeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, useonly)
{
  return this.inOrExcludeCertainGroupNumbersFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, useonly, true);
}
function excludeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, useonly)
{
  return this.inOrExcludeCertainGroupNumbersFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, useonly, false);
}
function includeCertainGroupNumbersOnlyFromCellStr(gpcellstr, ci, mygpcoli, hdrwi)
{
  return this.includeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, true);
}
function includeCertainGroupNumbersAndAddFromCellStr(gpcellstr, ci, mygpcoli, hdrwi)
{
  return this.includeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, false);
}
function excludeCertainGroupNumbersOnlyFromCellStr(gpcellstr, ci, mygpcoli, hdrwi)
{
  return this.excludeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, true);
}
function excludeCertainGroupNumbersAndAddFromCellStr(gpcellstr, ci, mygpcoli, hdrwi)
{
  return this.excludeCertainGroupNumbersOnlyOrNotFromCellStr(gpcellstr, ci, mygpcoli, hdrwi, false);
}


function inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, useonly, useone,
  mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["incgrpnumscell", "grpnumscoli", "mnhdri"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotFromCellStr(mdatobj[rkys[0]], ci, mdatobj[rkys[1]],
    mdatobj[rkys[2]], useonly, useone);
}
function includeCertainGroupNumbersOnColOnlyOrNotFromDatObj(ci, useonly, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, useonly, true, mdatobj);
}
function excludeCertainGroupNumbersOnColOnlyOrNotFromDatObj(ci, useonly, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, useonly, false, mdatobj);
}
function includeCertainGroupNumbersOnColOnly(ci, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, true, true, mdatobj);
}
function includeCertainGroupNumbersOrAddOnColOnly(ci, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, false, true, mdatobj);
}
function excludeCertainGroupNumbersOnColOnly(ci, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, true, false, mdatobj);
}
function excludeCertainGroupNumbersOrAddOnColOnly(ci, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, false, false, mdatobj);
}


function inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, useonly, useone)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(ci, useonly, useone,
    this.getMyDataInfoObjConsts());
}
function includeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, useonly, true);
}
function excludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, useonly, false);
}
function includeCertainGroupNumbersOnlyOnColFromDatObjMain(ci)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, true, true);
}
function includeCertainGroupNumbersOrAddOnColFromDatObjMain(ci)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, false, true);
}
function excludeCertainGroupNumbersOnlyOnColFromDatObjMain(ci)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, true, false);
}
function excludeCertainGroupNumbersOrAddOnColFromDatObjMain(ci)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObjMain(ci, false, false);
}


function inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly, useone,
  mdatobj=this.getMyDataInfoObjConsts())//only or add; one (include) or zero (exclude)
{
  const rkys = ["inccoli", "incgrpnumscell", "grpnumscoli", "mnhdri"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnColFromDatObj(mdatobj[rkys[0]], useonly, useone, mdatobj);
}
function includeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly,
  mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly, true, mdatobj);
}
function excludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly,
  mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly, false, mdatobj);
}
function includeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheet(mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(true, true, mdatobj);
}
function includeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheet(mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(false, true, mdatobj);
}
function excludeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheet(mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(true, false, mdatobj);
}
function excludeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheet(mdatobj=this.getMyDataInfoObjConsts())
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(false, false, mdatobj);
}

function inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(useonly, useone)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(useonly, useone,
    this.getMyDataInfoObjConsts());
}
function includeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(useonly, true);
}
function excludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(useonly)
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(useonly, false);
}
function includeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheetMain()
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(true, true);
}
function includeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheetMain()
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(false, true);
}
function excludeCertainGroupNumbersOnlyOnIncColFromDatObjAndSheetMain()
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(true, false);
}
function excludeCertainGroupNumbersOrAddOnIncColFromDatObjAndSheetMain()
{
  return this.inOrExcludeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheetMain(false, false);
}


//get the message row data object and variables and final message methods section:

function getValidMessageRowIndexes(myhdrwi, mymsgcoli)
{
  const mymxvmsgsrwi = this.getTheMaxValidRowIndex(mymsgcoli, myhdrwi, mymsgcoli);
  const errmsga = "the header row index must be at least zero, and less than the max row, but it was not!";
  const errmsgb = "the message col index must be at least zero, and less than the max col, but it was not!";
  if (myhdrwi < 0 || mxrow - 1 < myhdrwi)
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsga);
  }
  if (mymsgcoli < 0 || mxcol - 1 < mymsgcoli)
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsgb);
  }
  
  let vris = [];
  let nmskpd = 0;
  for (let r = myhdrwi + 1; r < mymxvmsgsrwi + 1 && r < mxrow; r++)
  {
    if (this.isValEmptyNullOrUndefined(mydata[r][mymsgcoli])) nmskpd++;
    else vris.push(r);
  }
  //console.log("vris = ", vris);
  //console.log("nmskpd = " + nmskpd);

  return {"validris": vris, "numskipped": nmskpd, "msgcolindex": mymsgcoli, "headerrowi": myhdrwi,
    "mymxvmsgsrwi": mymxvmsgsrwi};
}
function getValidMessageRowIndexesFromDatObj(mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getValidMessageRowIndexes(mdatobj[rkys[0]], mdatobj[rkys[1]]);
}
function getValidMessageRowIndexesFromDatObjMain()
{
  return this.getValidMessageRowIndexesFromDatObj(this.getMyDataInfoObjConsts());
}


function getMessageNumsFromRowIndexes(mymsgrwis, myhdrwi, mymsgcoli)
{
  const vrindxsdatobj = this.getValidMessageRowIndexes(myhdrwi, mymsgcoli);
  console.log("vrindxsdatobj = ", vrindxsdatobj);

  const rkys = ["validris"];
  this.letObjMustHaveTheseKeys(vrindxsdatobj, rkys, "vrindxsdatobj");
  const vris = vrindxsdatobj[rkys[0]];
  console.log("mymsgrwis = ", mymsgrwis);
  console.log("vris = ", vris);

  if (this.isValNullOrUndefined(mymsgrwis)) return null;
  else if (mymsgrwis.length < 1) return [];
  const msgnums = mymsgrwis.map((mval) => {
    this.letMustBeAnIntegerOnly(mval, "mval");
    if (mval < 0 || mxrow - 1 < mval) return -1;
    else
    {
      let myvi = -1;
      for (let i = 0; i < vris.length; i++)
      {
        if (mval === vris[i])
        {
          myvi = i;
          break;
        }
      }
      //console.log("myvi = " + myvi);

      if (myvi < 0 || vris.length - 1 < myvi)
      {
        throw new Error("the row index was not a valid row index for a message, if it was there is a " +
          "datatype problem in the caller!");
      }
      else return myvi + 1;
    }
  });
  return msgnums;
}
function getMessageNumsFromRowIndexesFromDatObj(mymsgrwis, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMessageNumsFromRowIndexes(mymsgrwis, mdatobj[rkys[0]], mdatobj[rkys[1]]);
}
function getMessageNumsFromRowIndexesFromDatObjMain(mymsgrwis)
{
  return this.getMessageNumsFromRowIndexesFromDatObj(mymsgrwis, this.getMyDataInfoObjConsts());
}


function getMyMessageRowDataObject(myhdrwi, mymsgcoli, mynumstr)
{
  //message number to be sent is saved in cell B2
  //the above value starts at 0 for no message to be sent at all.
  //from the header row index we add 1 to get the messages start row index.
  //msri = mhdrwi + 1;
  //finmsgri = msri + mnum - 1;
  //finmsgri = mhdrwi + mnum;
  this.letMustBeAnIntegerOnly(myhdrwi, "myhdrwi");
  this.letMustBeAnIntegerOnly(mynumstr, "mynumstr");
  const mymxvmsgsrwi = this.getTheMaxValidRowIndex(mymsgcoli, myhdrwi, mymsgcoli);
  const mnum = Number(mynumstr);
  const errmsga = "the header row index must be at least zero, and less than the max row, but it was not!";
  const errmsgb = "the starting message number must be at least zero and less than (" + (mxrow - myhdrwi) +
    "), but it was not!";
  if (myhdrwi < 0 || mxrow - 1 < myhdrwi)
  {
    //throw new Error(errmsga);
    this.throwAndOrAlertTheError(myalerterrs, errmsga);
  }
  if (mnum < 0 || mxrow - myhdrwi < mnum)
  {
    //throw new Error(errmsgb);
    this.throwAndOrAlertTheError(myalerterrs, errmsgb);
  }
  let vris = [];
  let nmskpd = 0;
  for (let r = myhdrwi + 1; r < mymxvmsgsrwi + 1 && r < mxrow; r++)
  {
    if (this.isValEmptyNullOrUndefined(mydata[r][mymsgcoli])) nmskpd++;
    else vris.push(r);
  }
  console.log("vris = ", vris);
  console.log("nmskpd = " + nmskpd);
  console.log("mnum = " + mnum);
  
  if (mnum < 0 || vris.length < mnum)
  {
    //throw new Error(errmsgb);
    this.throwAndOrAlertTheError(myalerterrs, errmsgb);
  }
  //else;//do nothing

  const msgrw = ((mnum < 1) ? -1 : ((0 < nmskpd) ? vris[mnum - 1] : myhdrwi + mnum));
  const mnumisinvld = (((mnum < 1) || (mymxvmsgsrwi < msgrw)) || !this.areAllItemsOfArrAInArrB([msgrw], vris));
  console.log("msgrw = " + msgrw);
  console.log("mxrow = " + mxrow);
  console.log("mymxvmsgsrwi = " + mymxvmsgsrwi);
  console.log("mnumisinvld = " + mnumisinvld);

  return {"mymsgnumstr": mynumstr, "mymsgnum": mnum, "msgrwi": msgrw, "mymxvmsgsrwi": mymxvmsgsrwi,
    "messagerowisnotvalid": mnumisinvld};
}
function getMyMessageRowDataObjectFromCell(myhdrwi, mymsgcoli, mymsgsntnmbrcell)
{
  this.letMustBeValidAOneNotation(mymsgsntnmbrcell, "mymsgsntnmbrcell");
  const mynumstr = ss.getRange(mymsgsntnmbrcell).getValue();
  return this.getMyMessageRowDataObject(myhdrwi, mymsgcoli, mynumstr);
}
function getMyMessageRowDataObjectFromInfoDatObjAndNumString(numstr, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyMessageRowDataObject(mdatobj[rkys[0]], mdatobj[rkys[1]], numstr);
}
function getMyMessageRowDataObjectFromInfoDatObjAndNumStringMain(numstr)
{
  return this.getMyMessageRowDataObjectFromInfoDatObjAndNumString(numstr, this.getMyDataInfoObjConsts());
}
function getMyMessageRowDataObjectFromInfoDatObj(mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli", "msgsntnmbrcell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyMessageRowDataObjectFromCell(mdatobj[rkys[0]], mdatobj[rkys[1]], mdatobj[rkys[2]]);
}
function getMyMessageRowDataObjectMain()
{
  return this.getMyMessageRowDataObjectFromInfoDatObj(this.getMyDataInfoObjConsts());
}
function getForUserMyMessageRowDataObject() { this.alertResultsToUser(this.getMyMessageRowDataObjectMain()); }


function addLeadingZeros(num, mxnumdgts)
{
  const mynumstr = "" + num;
  this.letMustBeADecimal(num, "num");
  this.letMustBeAnIntegerOnly(mxnumdgts, "mxnumdgts");
  if (mxnumdgts < 1) throw new Error("mxnumdgts must be at least 1!");
  
  if (num < 0) return "-" + this.addLeadingZeros(-num, mxnumdgts);
  if (mynumstr.length < mxnumdgts)
  {
    let ldingzeros = "";
    for (let i = 0; i < (mxnumdgts - mynumstr.length); i++) ldingzeros += "0";
    return ldingzeros + mynumstr;
  }
  else return mynumstr;
}

//https://en.wikipedia.org/wiki/Leap_year
function isLeapYear(yrnum)
{
  if (yrnum %4 === 0)
  {
    //most of the time this is
    if (yrnum %100 === 0) return (yrnum %400 === 0);
    else return true;
  }
  else return false;
}

function getNumDaysInTheMonth(mnthi, yrnm)
{
  //30 days has september(9-1=8) april (4-1=3) june(6-1=5) and november(11-1=10) all the rest have 31
  //except for february (2-1=1)
  const mnisfortrty = [3, 5, 8, 10];
  if (mnthi < 0 || 11 < mnthi) throw new Error("illegal month index value!");
  else
  {
    if (this.areAllItemsOfArrAInArrB([mnthi], mnisfortrty)) return 30;
    else if (mnthi === 2) return (this.isLeapYear(yrnm) ? 29 : 28);//28 if not leap year, 29 if leap year.
    else return 31;
  }
}

function getNameVarNames() { return ["name", "Name", "NAME"]; }
function getTimeVarNames() { return ["time", "Time", "TIME"]; }
function getDateVarNames() { return ["date", "Date", "DATE"]; }
function getMyNextVarNames() { return ["next", "nxt", "Next", "NXT", "NEXT"]; }
function getMorningVarNames() { return ["morning", "morn", "MORN", "MORNING"]; }
function getAfternoonVarNames() { return ["afternoon", "AFTERNOON"]; }
function getEveningVarNames() { return ["eve", "EVE", "eventide", "EVENTIDE", "evening", "EVENING"]; }
function getNightVarNames() { return ["night", "NIGHT"]; }
function getSkipVarNames()
{
  const txtonlyvars = this.twoWordComboGen("text", "only");
  const initskpvars = ["skip", "Skip", "SKIP", "ignore", "Ignore", "IGNORE"];
  return this.combineTwoLists(initskpvars, txtonlyvars, true);
}
function getNoDayVarNames()
{
  const initnodayvars = this.twoWordComboGen("no", "day");
  const dateonlyvars = this.twoWordComboGen("date", "only");
  return this.combineTwoLists(initnodayvars, dateonlyvars, true);
}
function getMornNoonMidDayEveningNightVarNames()
{
  const middayvars = this.twoWordComboGen("mid", "day");
  
  const mrningvars = this.getMorningVarNames();
  const aftrnoonvars = this.getAfternoonVarNames();
  const mornaftrnoonvars = this.combineTwoLists(mrningvars, aftrnoonvars, true);
  
  const evningvars = this.getEveningVarNames();
  const ntvars = this.getNightVarNames();
  const evningntvars = this.combineTwoLists(evningvars, ntvars, true);
  
  const initmaftrntvars = this.combineTwoLists(mornaftrnoonvars, evningntvars, true);
  return this.combineTwoLists(initmaftrntvars, middayvars, true);
}
function getAllNoDayAndDayVarNames()
{
  return this.combineTwoLists(this.getNoDayVarNames(), this.getMornNoonMidDayEveningNightVarNames());
}

function getMyDaysOfTheWeek()
{
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
}
function getAllOptionsForMyDaysOfTheWeek()
{
  //wkdy sunday ..., keep all lower case, captialize the s, then captialize the whole thing.
  return this.genLowerSnakeUpperWords(this.getMyDaysOfTheWeek());
  //return this.getMyDaysOfTheWeek().map((wkdy, wkdi) => {
    //wkdy sunday ..., keep all lower case, captialize the s, then captialize the whole thing.
  //  return ["" + wkdy, wkdy.charAt(0).toUpperCase() + wkdy.substring(1), wkdy.toUpperCase()];
  //});
}
function getOneDArrayOfAllOptionsForMyDaysOfTheWeek()
{
  const mdyswk = this.getAllOptionsForMyDaysOfTheWeek();
  let finmydyswk = [];
  mdyswk.forEach((wkdylist) => wkdylist.forEach((wkdy) => finmydyswk.push(wkdy)));
  return finmydyswk;
}
function getAllDayOfWeekAcceptedVarNames()
{
  const findaysofweekonedarr = this.getOneDArrayOfAllOptionsForMyDaysOfTheWeek();
  const nodayanddayvars = this.getAllNoDayAndDayVarNames();
  const mynxtopts = this.getMyNextVarNames();
  //NEXT_DAYOFWEEK_NODAYDAYVARS
  //NEXT_DAYOFWEEK
  let mygenvnms = [];
  mynxtopts.forEach((nxtoptval) => {
    findaysofweekonedarr.forEach((dayval) => {
      const mybasestr = nxtoptval + "_" + dayval;
      mygenvnms.push(mybasestr);
      nodayanddayvars.forEach((tofdayval) => mygenvnms.push(mybasestr + "_" + tofdayval));
    });
  });
  return mygenvnms;
}

//EXPENSIVE TO CALCULATE, BUT LESS EXPENSIVE THAN THE TWO THAT DEPEND ON IT
function getEmailAddressVarNames()
{
  const initaddrwds = ["address", "addr"];
  const fltlwrsnkupaddrwds = this.genAndFlattenLowerSnakeUpperWords(initaddrwds);
  //console.log("fltlwrsnkupaddrwds = ", fltlwrsnkupaddrwds);

  const fltcmbosemladdra = this.genAndFlattenAMapOfTwoWordCombos(fltlwrsnkupaddrwds, "email", true);
  const fltcmbosemladdrb = this.genAndFlattenAMapOfTwoWordCombos(fltlwrsnkupaddrwds, "Email", true);
  const fltcmbosemladdrc = this.genAndFlattenAMapOfTwoWordCombos(fltlwrsnkupaddrwds, "eml", true);
  //console.log("fltcmbosemladdra = ", fltcmbosemladdra);
  //console.log("fltcmbosemladdrb = ", fltcmbosemladdrb);
  //console.log("fltcmbosemladdrc = ", fltcmbosemladdrc);
  
  const fltcmbosemladdrab = this.combineTwoLists(fltcmbosemladdra, fltcmbosemladdrb, true);
  const allfltcmbosemladdr = this.combineTwoLists(fltcmbosemladdrab, fltcmbosemladdrc, true);
  //console.log("allfltcmbosemladdr = ", allfltcmbosemladdr);

  return allfltcmbosemladdr;
}

//EXPENSIVE TO CALCULATE
function getReplyToEmailAddressVarNames(emladdrvars=this.getSimpEmailAddressVarNames())
{
  this.letMustNotBeEmpty(emladdrvars, "emladdrvars");
  const fltlwrsnkupaddrwds = this.genAndFlattenLowerSnakeUpperWords(["address", "addr"]);
  //console.log("fltlwrsnkupaddrwds = ", fltlwrsnkupaddrwds);

  //const fltreplwrsnkupwds = this.genAndFlattenLowerSnakeUpperWords(["reply", "rep"]);
  //console.log("fltreplwrsnkupwds = ", fltreplwrsnkupwds);

  const myreps = ["reply", "rep", "Reply", "Rep"];
  //fltlwrsnkupaddrwds
  const myrepaddrs = myreps.map((repwd) => this.genAndFlattenAMapOfTwoWordCombos(fltlwrsnkupaddrwds, repwd, true));
  //console.log("myrepaddrs = ", myrepaddrs);

  const fltmyrepaddrs = this.convertATwoDStringArrayToAOneDStringArray(myrepaddrs, true);
  //console.log("reply address list = fltmyrepaddrs = ", fltmyrepaddrs);
  //the list above are the reply addresses list

  const replytowdsa = this.twoWordComboGen("reply", "to");
  //console.log("replytowdsa = ", replytowdsa);

  const replytowdsb = this.twoWordComboGen("Reply", "to");
  //console.log("replytowdsb = ", replytowdsb);
  
  const finreptoaddrs = this.combineTwoLists(replytowdsa, replytowdsb, true);
  //console.log("reply to list = finreptoaddrs = ", finreptoaddrs);
  //this list above holds reply_to combinations...

  //const emladdrvars = this.getEmailAddressVarNames();
  //console.log("emladdrvars = ", emladdrvars);

  const myreptoemladdrs = finreptoaddrs.map((repwd) =>
    this.genAndFlattenAMapOfTwoWordCombos(emladdrvars, repwd, true));
  //console.log("myreptoemladdrs = ", myreptoemladdrs);

  const fltmyreptoaddrs = this.convertATwoDStringArrayToAOneDStringArray(myreptoemladdrs, true);
  //console.log("reply to address list = fltmyreptoaddrs = ", fltmyreptoaddrs);
  //the list above are the reply addresses list

  const cmbindfulllist = this.combineTwoLists(fltmyrepaddrs, fltmyreptoaddrs, true);
  //console.log("cmbindfulllist = ", cmbindfulllist);

  return cmbindfulllist;
}

//EXPENSIVE TO CALCULATE
function getSenderEmailAddressVarNames(emladdrvars=this.getSimpEmailAddressVarNames())
{
  this.letMustNotBeEmpty(emladdrvars, "emladdrvars");
  const fltmylwrsnkupsndrwds = this.genAndFlattenLowerSnakeUpperWords(["sender", "sndr"], true);
  //console.log("fltmylwrsnkupsndrwds = ", fltmylwrsnkupsndrwds);
  
  const fltlwrsnkupaddrwds = this.genAndFlattenLowerSnakeUpperWords(["address", "addr"]);
  //console.log("fltlwrsnkupaddrwds = ", fltlwrsnkupaddrwds);

  const mysndraddrs = fltmylwrsnkupsndrwds.map((sndrwd) =>
    this.genAndFlattenAMapOfTwoWordCombos(fltlwrsnkupaddrwds, sndrwd, true));
  //console.log("mysndraddrs = ", mysndraddrs);

  const fltmysndraddrs = this.convertATwoDStringArrayToAOneDStringArray(mysndraddrs, true);
  //console.log("sender address list = fltmysndraddrs = ", fltmysndraddrs);
  //the list above are the reply addresses list

  //const emladdrvars = this.getEmailAddressVarNames();
  //console.log("emladdrvars = ", emladdrvars);

  const mysndremladdrs = fltmylwrsnkupsndrwds.map((repwd) =>
    this.genAndFlattenAMapOfTwoWordCombos(emladdrvars, repwd, true));
  //console.log("mysndremladdrs = ", mysndremladdrs);

  const fltmysndremladdrs = this.convertATwoDStringArrayToAOneDStringArray(mysndremladdrs);
  //console.log("fltmysndremladdrs = ", fltmysndremladdrs);

  const finallsndraddrs = this.combineTwoLists(fltmysndraddrs, fltmysndremladdrs, true);
  //console.log("finallsndraddrs = ", finallsndraddrs);

  return finallsndraddrs;
}


//cache object for var names that are really expensive to calculate methods

let myemladdrdatobj = null;//cache object for varnms that are expensive to calculate

function getMyEmailAddressDataObject()
{
  if (this.isValUndefinedOrNull(myemladdrdatobj))
  {
    //generate it, then set it, then get it...
    const nwobjval = this.generateMyEmailAddressDataObject();
    this.setMyEmailAddressDataObject(nwobjval);
    this.letMustBeDefined(myemladdrdatobj, "myemladdrdatobj");
    return myemladdrdatobj;
  }
  else return myemladdrdatobj;
}
function setMyEmailAddressDataObject(nwobjval)
{
  //it will be null or have all of the required keys...
  if (this.isValNullOrUndefined(nwobjval));
  else
  {
    const omrkys = ["emailaddressvarnms", "replytoemailaddressvarnms", "senderemailaddressvarnms"];
    this.letObjMustHaveTheseKeys(nwobjval, omrkys, "nwobjval");
  }
  myemladdrdatobj = nwobjval;
}
function generateMyEmailAddressDataObject()
{
  const emladdrvars = this.getEmailAddressVarNames();
  //console.log("emladdrvars = ", emladdrvars);

  const myobj = { "emailaddressvarnms": emladdrvars,
    "replytoemailaddressvarnms": this.getReplyToEmailAddressVarNames(emladdrvars),
    "senderemailaddressvarnms": this.getSenderEmailAddressVarNames(emladdrvars) };
  return myobj;
}

//attempts to pull the email address var names (not reply to, and not sender) from the cached object
//if the cached object is undefined in this case because this is meant to be called inside:
//getReplyToEmailAddressVarNames(), and getSenderEmailAddressVarNames()
//we need to only return the results, but not generate the object as this may potentially cause an infinite loop
//so we are using this method to attempt to avoid an infinite recursion error/memory stack over flow error
function getSimpEmailAddressVarNames()
{
  if (this.isValUndefinedOrNull(myemladdrdatobj)) return this.getEmailAddressVarNames();
  else
  {
    const omrkys = ["emailaddressvarnms", "replytoemailaddressvarnms", "senderemailaddressvarnms"];
    this.letObjMustHaveTheseKeys(myemladdrdatobj, omrkys, "myemladdrdatobj");
    return myemladdrdatobj["emailaddressvarnms"];
  }
}

function getMessageOrSubjectVarNames(usemsg)
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const msgvnms = (usemsg ? ["message", "msg"]: ["subject", "sbj"]);
  const fltmylwrsnkupmsgwds = this.genAndFlattenLowerSnakeUpperWords(msgvnms);
  //console.log("fltmylwrsnkupmsgwds = ", fltmylwrsnkupmsgwds);
  return fltmylwrsnkupmsgwds;
}
function getMessageVarNames() { return this.getMessageOrSubjectVarNames(true); }
function getSubjectVarNames() { return this.getMessageOrSubjectVarNames(false); }
function getMessageOrSubjectNumberVarNames(usemsg)
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const fltmylwrsnkupmsgwds = getMessageOrSubjectVarNames(usemsg);
  //console.log("fltmylwrsnkupmsgwds = ", fltmylwrsnkupmsgwds);

  const fltmylwrsnkupnumwds = this.genAndFlattenLowerSnakeUpperWords(["number", "num"]);
  //console.log("fltmylwrsnkupnumwds = ", fltmylwrsnkupnumwds);

  const mymsgnums = fltmylwrsnkupmsgwds.map((msgstr) =>
    this.genAndFlattenAMapOfTwoWordCombos(fltmylwrsnkupnumwds, msgstr, true));
  //console.log("mymsgnums = ", mymsgnums);

  const fltmymsgnums = this.flattenATwoDArrayToAOneDArray(mymsgnums, true);
  //console.log("fltmymsgnums = ", fltmymsgnums);

  //not sure if I should add the delimeters here or not...
  return fltmymsgnums;
}
function getMessageNumberVarNames() { return this.getMessageOrSubjectNumberVarNames(true); }
function getSubjectNumberVarNames() { return this.getMessageOrSubjectNumberVarNames(false); }

function isVarNameOnMessageOrSubjectNames(vnm, usemsg)
{
  this.letMustBeBoolean(usemsg, "usemsg");
  this.letMustNotBeEmpty(vnm, "vnm");
  const msgorsbjvarnms = this.getMessageOrSubjectNumberVarNames(usemsg);
  this.letMustNotBeEmpty(msgorsbjvarnms, "msgorsbjvarnms");
  //the varnm will start with the message or subject varnm,
  //but it will have some kind of delimeter and then a number after that only
  //MESSAGE_NUMBER_7 for example.
  //console.log("msgorsbjvarnms = ", msgorsbjvarnms);
  //console.log("usemsg = " + usemsg);
  //console.log("vnm = " + vnm);

  for (let i = 0; i < msgorsbjvarnms.length; i++)
  {
    if (vnm.indexOf(msgorsbjvarnms[i]) === 0)
    {
      //this is valid...
      let aftrstr = vnm.substring(msgorsbjvarnms[i].length);
      //the first character on the aftrstr must be either _ or - or the number...
      //everything after that first character must be a number...
      //console.log("aftrstr = " + aftrstr);

      const fnindx = ((aftrstr.charAt(0) === '_' || aftrstr.charAt(0) === '-') ? 1: 0);
      let finaftrstr = aftrstr.substring(fnindx);
      //console.log("finaftrstr = " + finaftrstr);

      //this must be an integer
      this.letMustBeAnIntegerOnly(finaftrstr, "finaftrstr");
      return true;
    }
  }
  return false;
}
function isVarNameOnMessageNames(vnm) { return this.isVarNameOnMessageOrSubjectNames(vnm, true); }
function isVarNameOnSubjectNames(vnm) { return this.isVarNameOnMessageOrSubjectNames(vnm, false); }

function isVarNameProgramDefined(vnm)
{
  this.letMustNotBeEmpty(vnm, "vnm");
  const myemladdrobj = this.getMyEmailAddressDataObject();
  return (this.areAllItemsOfArrAInArrB([vnm], this.getSkipVarNames()) ||
    this.areAllItemsOfArrAInArrB([vnm], this.getNameVarNames()) ||
    this.areAllItemsOfArrAInArrB([vnm], this.getTimeVarNames()) ||
    this.areAllItemsOfArrAInArrB([vnm], this.getDateVarNames()) ||
    this.areAllItemsOfArrAInArrB([vnm], this.getAllDayOfWeekAcceptedVarNames()) ||
    this.areAllItemsOfArrAInArrB([vnm], myemladdrobj["replytoemailaddressvarnms"]) ||
    this.areAllItemsOfArrAInArrB([vnm], myemladdrobj["senderemailaddressvarnms"]) ||
    this.isVarNameOnMessageNames(vnm) || this.isVarNameOnSubjectNames(vnm));
}

function getPossibleVariableNamesAndLocations(mstr)
{
  //a variable name is found inside of <> often just one like that
  //no spaces inside it, alphabetic text only, and underscores only.
  //with one exception <skip></skip> will be closed...
  let mopis = this.getAllIndexesOf("<", mstr, 0);
  //let mcpis = this.getAllIndexesOf(">", mstr, 0);
  console.log("mopis = ", mopis);

  let mobjs = [];
  const mkspvnms = this.getSkipVarNames();
  for (let n = 0; n < mopis.length; n++)
  {
    if (mopis[n] < 0 || mstr.length - 1 < mopis[n]) return [];
    else
    {
      //the index is valid
      let fndpi = false;
      let mpi = -1;
      for (let i = mopis[n] + 1; i < mstr.length; i++)
      {
        if (mstr[i] === '_' || mstr[i] === '/');
        else if (this.myIsAlpha(mstr[i]));
        else if (mstr[i] === '>')
        {
          //found our pair...
          fndpi = true;
          mpi = i;
          break;
        }
        else if (mstr[i] === ' ')
        {
          //not legal as variable start move on to next...
          fndpi = false;
          mpi = -1;
          break;
        }
      }//end of i for loop
      console.log("fndpi = " + fndpi);
      console.log("mpi = " + mpi);

      if (fndpi)
      {
        let vnm = mstr.substring(mopis[n] + 1, mpi);
        let finei = mpi;
        if (this.areAllItemsOfArrAInArrB([vnm], mkspvnms))
        {
          //now go to </skip>
          let cskpindxs = this.getAllIndexesOf("</" + vnm + ">", mstr, 0);
          console.log("cskpindxs = ", cskpindxs);

          let fndopi = false;
          let myopi = -1;
          for (let k = 0; k < cskpindxs.length; k++)
          {
            if (mpi < cskpindxs[k])
            {
              fndopi = true;
              myopi = k;
              break;
            }
          }//end of k for loop
          console.log("fndopi = " + fndopi);
          console.log("myopi = " + myopi);

          if (fndopi)
          {
            finei = cskpindxs[myopi] + vnm.length + 3;
            let fndnwk = false;
            for (let k = 0; k < mopis.length; k++)
            {
              if (mopis[k] === cskpindxs[myopi])
              {
                fndnwk = true;
                n = k;
                break;
              }
            }//end of k for loop
            if (fndnwk)
            {
              mobjs.push({"varnm": vnm, "si": mopis[n], "ei": finei, "vnmisprogramdefined": true});
              continue;
            }
            else throw new Error("the new k must have been found, but it was not!");
          }
          else throw new Error("the end of the skip must be found, but it was not!");
        }
        //else;//do nothing
        mobjs.push({"varnm": vnm, "si": mopis[n], "ei": finei,
          "vnmisprogramdefined": this.isVarNameProgramDefined(vnm)});
      }
      //else;//do nothing continue
    }
  }//end of n for loop
  return mobjs;
}

function getTheUserEmailAddress()
{
  //const cuemladdr = Session.getActiveUser().getEmail();
  const cuemladdr = DriveApp.getRootFolder().getOwner().getEmail();
  this.letMustNotBeEmpty(cuemladdr, "cuemladdr");
  return cuemladdr;
}

//NOTE: this may change if other variables like DATE or TIME or other stuff are added
//it might also need to change so it accepts all variations of the variables 8-8-2025 3:34 AM MST


//may also want to tell the user what variables they can use in messages and how they will be parsed
//or have the user provide the values of course...

//NOTE: DEPENDS ON DATE JAVASCRIPT LIBRARY
//
//If the message or subject has variables that the program can subsitute the values or calculate them
//that is what this method does. However if the user does not want that they can do <skip><myvar></skip>
//the wrapping it around with skips like that tells the program not to substitute the value for it.
//but the skip is executed regardless. Otherwise <myvar> will have the value subsituted in for it.
//<date,Date,DATE> one of those for the current date.
//<time,Time,TIME> one of those for the current time.
//To get the next Sunday one would do <NEXT_SUNDAY> which replaces it with "Sunday mn/dy/year" all numbers
//But if you do not want the day part do <NEXT_SUNDAY_NO_DAY> which replaces it with "mn/dy/year" all numbers
//NOTE: On the NEXT_WEEKDAY variables, if you call it on that day it will give it a week later, for example
//if you call it on Sunday 8-17-2025 then the next Sunday will be 8-24-2025 and it will give you this instead.
//but if you call it before that saying you want next Sunday and call it on say Friday 8-15-2025 it will give you
//Sunday 8-17-2025.
//orig_message_type stores "MESSAGE", "SUBJECT", anything else is other
//the meesage type corresponds to the sheet is it in the messages column or the subjects colmn or just a test?
function getFinalMessageContent(origmsg, nmval, origmsgtp, mysbjscoli, mymsgrwis=[-1])
{
  this.letMustBeDefined(origmsg, "origmsg");
  this.letMustBeDefined(nmval, "nmval");
  this.letMustBeAnIntegerOnly(mysbjscoli, "mysbjscoli");
  const merrmsga = "my subjects col index must be at least zero and less than the max col, but it was not!";
  if (mysbjscoli < 0 || mxcol - 1 < mysbjscoli)
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  if (this.isValNullOrUndefined(mymsgrwis))
  {
    return this.getFinalMessageContent(origmsg, nmval, origmsgtp, mysbjscoli, [-1]);
  }
  mymsgrwis.forEach((mymsgrwi) => this.letMustBeAnIntegerOnly(mymsgrwi, "mymsgrwi"));

  const myemladdrobj = this.getMyEmailAddressDataObject();
  const datenms = this.getDateVarNames();
  const timenms = this.getTimeVarNames();
  const nmvars = this.getNameVarNames();
  const dtandtmvarnms = this.combineTwoLists(datenms, timenms, true);
  const repaddrvarnms = myemladdrobj["replytoemailaddressvarnms"];
  const sndraddrvarnms = myemladdrobj["senderemailaddressvarnms"];
  const nmanddtvarnms = this.combineTwoLists(nmvars, dtandtmvarnms, true);
  const allemladdrvarnms = this.combineTwoLists(sndraddrvarnms, repaddrvarnms, true);
  const msgvarnms = this.getMessageNumberVarNames();
  const sbjvarnms = this.getSubjectNumberVarNames();
  const allmsgandsbjvarnms = this.combineTwoLists(msgvarnms, sbjvarnms, true);
  //const allemlandmsgandsbjvarnms = this.combineTwoLists(allemladdrvarnms, allmsgandsbjvarnms, true);
  const acptvarnms = this.combineTwoLists(nmanddtvarnms, allemladdrvarnms, true);
  
  //const txtonlyvars = this.twoWordComboGen("text", "only");
  //const initskpvars = ["skip", "Skip", "SKIP", "ignore", "Ignore", "IGNORE"];
  //const skpvars = this.combineTwoLists(initskpvars, txtonlyvars, true);//this.getSkipVarNames();
  const skpvars = this.getSkipVarNames();
  
  //const initnodayvars = this.twoWordComboGen("no", "day");
  //const dateonlyvars = this.twoWordComboGen("date", "only");
  //const nodayvars = this.combineTwoLists(initnodayvars, dateonlyvars, true);
  const nodayvars = this.getNoDayVarNames();

  const nxtvars = this.getMyNextVarNames();
  
  const dtoptptvars = ["", "morning", "mid-day", "afternoon", "evening", "night"];
  const middayvars = this.twoWordComboGen("mid", "day");
  
  const mrningvars = this.getMorningVarNames();
  const aftrnoonvars = this.getAfternoonVarNames();
  const mornaftrnoonvars = this.combineTwoLists(mrningvars, aftrnoonvars, true);
  
  const evningvars = this.getEveningVarNames();
  const ntvars = this.getNightVarNames();
  const evningntvars = this.combineTwoLists(evningvars, ntvars, true);
  
  const initmaftrntvars = this.combineTwoLists(mornaftrnoonvars, evningntvars, true);
  const maftrntvars = this.combineTwoLists(initmaftrntvars, middayvars, true);
  console.log("origmsgtp = " + origmsgtp);
  console.log("origmsg = " + origmsg);
  console.log("nmval = " + nmval);
  //console.log("allmsgandsbjvarnms = ", allmsgandsbjvarnms);

  const msgvnms = ["message", "msg"];
  const sbjvnms = ["subject", "sbj"];
  const fltmylwrsnkupmsgwds = this.genAndFlattenLowerSnakeUpperWords(msgvnms);
  const fltmylwrsnkupsbjwds = this.genAndFlattenLowerSnakeUpperWords(sbjvnms);
  //console.log("fltmylwrsnkupmsgwds = ", fltmylwrsnkupmsgwds);
  //console.log("fltmylwrsnkupsbjwds = ", fltmylwrsnkupsbjwds);

  const msgtpstrisempty = this.isValEmptyNullOrUndefined(origmsgtp);
  const origmsgismsg = (msgtpstrisempty ? false : this.areAllItemsOfArrAInArrB([origmsgtp], fltmylwrsnkupmsgwds));
  const origmsgissbj = (msgtpstrisempty ? false : this.areAllItemsOfArrAInArrB([origmsgtp], fltmylwrsnkupsbjwds));
  console.log("origmsgismsg = " + origmsgismsg);
  console.log("origmsgissbj = " + origmsgissbj);


  //seach for the skip parts
  //split the string and separate out the skip parts
  //or at least figure out where would be the best spots too
  //other stuff ... <skipvarnm><varnm></skipvarnm> other stuff...
  //                ^                             ^ string boundaries where it gets split
  //using the get all indexes of for every combination...

  //Dear <Name>, this is a test! The date <skip><NEXT_SUNDAY></skip> the time <skip><TIME></skip> are here!
  //01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123
  //0         1         2         3         4         5         6         7         8         9         0
  //0                                                                                                   1
  
  let alleispvarnm = [];
  const allsispvarnm = skpvars.map((svarnm) => {
    let tempsis = this.getAllIndexesOf("<" + svarnm + ">", origmsg, 0);
    let tempeis = this.getAllIndexesOf("</" + svarnm + ">", origmsg, 0);
    if (tempsis.length === tempeis.length)
    {
      alleispvarnm.push(tempeis);
      return tempsis;
    }
    else throw new Error("there must be the same number of ending indexes as starting indexes!");
  });
  console.log("allsispvarnm = ", allsispvarnm);
  console.log("alleispvarnm = ", alleispvarnm);
  
  let fndaskip = false;
  for (let i = 0; i < allsispvarnm.length; i++)
  {
    let mlist = allsispvarnm[i];
    this.letMustNotBeEmpty(mlist, "mlist");
    if (mlist.length === 1 && mlist[0] < 0);
    else
    {
      fndaskip = true;
      break;
    }
  }
  console.log("fndaskip = " + fndaskip);


  //section 0:
  //the preprocessing section handles the skip or ignore stuff variable tags
  //code above this does error checking and declares the variables needed for the rest of the program

  if (fndaskip)
  {
    //GOAL: know where to split the string
    //first filter the lists down to what matters
    //second we need to sort the lists
    //we have a problem because the start and end indexes are lists of lists...
    //we do know there is one start index for one end index...
    //so we could make an array of objects that has this...
    //third we generate a list of indexes we use to split the string with...
    const fvarnms = skpvars.filter((varnm, vi) => !(allsispvarnm[vi].length === 1 && allsispvarnm[vi][0] < 0));
    const feispvnm = alleispvarnm.filter((varnm, vi) =>
      !(allsispvarnm[vi].length === 1 && allsispvarnm[vi][0] < 0));
    const fsispvnm = allsispvarnm.filter((mlist, mi) => !(mlist.length === 1 && mlist[0] < 0));
    console.log("fvarnms = ", fvarnms);
    console.log("fsispvnm = ", fsispvnm);
    console.log("feispvnm = ", feispvnm);

    let fvarnmsobjs = [];
    fvarnms.forEach((varnm, vi) => {
      //for each var name there is a list of start and a list of end indexes
      //we want an object that has all 3 together.
      fsispvnm[vi].forEach((item, indx) =>
        fvarnmsobjs.push({"varnm": varnm, "si": item, "ei": feispvnm[vi][indx]}));
    });
    console.log("OLD fvarnmsobjs = ", fvarnmsobjs);

    fvarnmsobjs = fvarnmsobjs.sort((a, b) => a.si - b.si);
    console.log("NEW fvarnmsobjs = ", fvarnmsobjs);

    let finindxs = [];
    fvarnmsobjs.forEach((mobj, vi) => {
      //start then end index
      //keep start index, end index needs to be 1 for slash and 2 for end thing plus varnm length
      finindxs.push(mobj.si);
      finindxs.push(mobj.ei + 3 + mobj.varnm.length);
    });
    console.log("finindxs = ", finindxs);

    //now just split the string at those indexes...
    //the new strings are then going to be gone over by the program as normal except for the ones with skip
    //these will need to be handled separately then we can get the final return value.
    
    //const mystrs = this.mySplit(mstr, delimis, delimlens, true);
    const mystrs = this.mySplitWithLen(origmsg, finindxs, 0, true);
    //const mystrs = this.mySplitWithDelim(mstr, delimstr, true);//cannot use here
    //const mystrs = ["Dear <Name>, this is a test! The date ", "<skip><NEXT_SUNDAY></skip>",
    //  " the time ", "<skip><TIME></skip>", " are here!"];
    console.log("mystrs = ", mystrs);

    const isskpstrs = mystrs.map((mstr, mindx) => {
      //is one of the indexs valid for the var name
      //it will be 0
      for (let n = 0; n < fvarnms.length; n++)
      {
        if (mstr.indexOf("<" + fvarnms[n] + ">") === 0) return true;
      }
      return false;
    });
    console.log("isskpstrs = ", isskpstrs);
    console.log("CALLING THE METHOD AGAIN HERE MAYBE:");

    const merrmsgb = "the string has a varnm in it, but now it claims it did not!";
    const myfinmystrs = mystrs.map((mstr, mindx) => {
      if (isskpstrs[mindx])
      {
        for (let n = 0; n < fvarnms.length; n++)
        {
          if (mstr.indexOf("<" + fvarnms[n] + ">") === 0)
          {
            return mstr.substring(fvarnms[n].length + 2, mstr.length - fvarnms[n].length - 3);
          }
        }
        //throw new Error(merrmsgb);
        this.throwAndOrAlertTheError(myalerterrs, merrmsgb);
      }
      else return this.getFinalMessageContent(mstr, nmval, origmsgtp, mysbjscoli, mymsgrwis);
    });
    console.log("myfinmystrs = ", myfinmystrs);

    return myfinmystrs.join("");
  }
  //else;//do nothing


  //if none of the variables are found, then it returns the origmsg string
  //if one of them is found, then it does the substitution and then calls the method again with the new message
  //the idea is then that eventually there will be no variables found and then it returns the final message.

  //section 1:
  //this code handles the things like date and time and name that are really easy
  //but the next_sunday_morning ... is not handled in this section that is handled in section 2

  const lptmerrmsg = " must be on the full list (" + (acptvarnms.join(", ")) + "), but it was not!";
  for (let i = 0; i < acptvarnms.length; i++)
  {
    //console.log("acptvarnms[" + i + "] = " + acptvarnms[i]);
    //console.log("acptvarnms[" + i + "].length = " + acptvarnms[i].length);

    const nmi = origmsg.indexOf("<" + acptvarnms[i] + ">");
    if (nmi < 0 || origmsg.length - 1 < nmi);
    else
    {
      //this is where we determine the new value (what we are substituting in for the variable)
      //this part is subject to change...
      let mval = null;
      if (this.areAllItemsOfArrAInArrB([acptvarnms[i]], nmvars)) mval = "" + nmval;
      else if (this.areAllItemsOfArrAInArrB([acptvarnms[i]], dtandtmvarnms))
      {
        //console.log("acptvarnms[" + i + "] = " + acptvarnms[i]);
        //console.log("THIS IS A DATE OR A TIME VAR NAME!");

        let mdateobj = new Date();
        //console.log(mdateobj.getFullYear());//year number
        //console.log(mdateobj.getDay());//day of week index 2 for wednesday
        //console.log(mdateobj.getDate());//day number of month
        //console.log(mdateobj.getMonth());//month index starts at 0 goes up to 11 inclusive 7 for august
        //console.log(mdateobj.getHours());//returns between 0 and 23 inclusive
        //console.log(mdateobj.getMinutes());//returns between 0 and 59 inclusive
        //console.log(mdateobj.getSeconds());//returns between 0 and 59 inclusive
        //console.log(mdateobj.getMilliseconds());//returns between 0 and 999 inclusive.
        //console.log(mdateobj);
        if (this.areAllItemsOfArrAInArrB([acptvarnms[i]], datenms))
        {
          mval = "" + (mdateobj.getMonth() + 1) + "/" + mdateobj.getDate() + "/" + mdateobj.getFullYear();
        }
        else
        {
          mval = "" + this.addLeadingZeros((mdateobj.getHours()), 2) + ":" +
            this.addLeadingZeros((mdateobj.getMinutes()), 2) + ":" +
            this.addLeadingZeros((mdateobj.getSeconds()), 2) + "." +
            this.addLeadingZeros((mdateobj.getMilliseconds()), 2);
          
          //alternative way to do this:
          //const mfuncnms = ["getHours", "getMinutes", "getSeconds", "getMilliseconds"];
          //const mstrs = mfuncnms.map((fnm, findx) =>
          //  this.addLeadingZeros(mdateobj[fnm].call(mdateobj), 2) +
          //  ((findx + 2 < mfuncnms.length) ? ":" : ((findx + 1 < mfuncnms.length) ? "." : "")));
          //mval = mstrs.join("");//:
          //mval = mval.substring(0, mval.lastIndexOf(":")) + "." + mval.substring(mval.lastIndexOf(":") + 1);
        }
      }
      else if (this.areAllItemsOfArrAInArrB([acptvarnms[i]], repaddrvarnms))
      {
        //console.log("acptvarnms[" + i + "] = " + acptvarnms[i]);
        //console.log("THIS IS A REPLY TO EMAIL ADDRESS VAR NAME!");
        //get it from the sheet
        //then substitute the value for it
        //if the reply to email address is empty or null, kill the program
        const mdatobj = this.getMyDataInfoObjConsts();
        const rkys = ["replyaddrcell"];
        this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
        const myrepcl = mdatobj[rkys[0]];
        this.letMustBeValidAOneNotation(myrepcl, "myrepcl");
        const repemladdr = ss.getRange(myrepcl).getValue();
        //console.log("repemladdr = " + repemladdr);
        
        this.letMustNotBeEmpty(repemladdr, "reply_to_email_address");
        mval = "" + repemladdr;
      }
      else if (this.areAllItemsOfArrAInArrB([acptvarnms[i]], sndraddrvarnms))
      {
        //console.log("acptvarnms[" + i + "] = " + acptvarnms[i]);
        //console.log("THIS IS A SENDER EMAIL ADDRESS VAR NAME!");
        
        //gets the email address of the user
        const cuemladdr = this.getTheUserEmailAddress();
        //console.log("cuemladdr = " + cuemladdr);

        this.letMustNotBeEmpty(cuemladdr, "current_user_email_address");
        mval = "" + cuemladdr;
      }
      else
      {
        const merrmsgc = "" + acptvarnms[i] + lptmerrmsg;
        //throw new Error(merrmsgc);
        this.throwAndOrAlertTheError(myalerterrs, merrmsgc);
      }

      console.log("CALLING THE METHOD AGAIN NOW:");
      //call the method again so the indexes do not get messed up either that or
      //we need to parse the string in reverse
      //but in this case it actually depends on the order of the variables...
      //so parsing the string in reverse will not have any effect due to how the new string is built below.
      //that and we are using indexOf for nmi so that gets the first index
      //so really our only option is to call this recursively.
      const nwmsg = origmsg.substring(0, nmi) + mval + origmsg.substring(nmi + acptvarnms[i].length + 2);
      return this.getFinalMessageContent(nwmsg, nmval, origmsgtp, mysbjscoli, mymsgrwis);
    }
  }//end of i for loop
  

  //extract the message or subject number varnms
  //normally this would have been in the loop above except since we have only partial it cannot be
  //but it requires less work than the variables in section 2 so it is part of section 1.

  for (let n = 0; n < allmsgandsbjvarnms.length; n++)
  {
    const nmi = origmsg.indexOf("<" + allmsgandsbjvarnms[n]);
    if (nmi < 0 || origmsg.length - 1 < nmi);
    else
    {
      console.log("nmi = " + nmi);
      console.log("allmsgandsbjvarnms[" + n + "] = " + allmsgandsbjvarnms[n]);

      let eovarnmi = -1;
      for (let i = nmi + 1; i < origmsg.length; i++)
      {
        if (origmsg.charAt(i) === '>')
        {
          eovarnmi = i;
          break;
        }
      }//end of i for loop
      console.log("eovarnmi = " + eovarnmi);

      if (eovarnmi < nmi || origmsg.length - 1 < eovarnmi);
      else
      {
        let fulvarnm = origmsg.substring(nmi, eovarnmi + 1);
        let vnmfextrn = fulvarnm.substring(1, fulvarnm.length - 1);
        console.log("fulvarnm = " + fulvarnm);
        console.log("vnmfextrn = " + vnmfextrn);

        let aftrstr = vnmfextrn.substring(allmsgandsbjvarnms[n].length);
        console.log("aftrstr = " + aftrstr);

        let fnindx = ((aftrstr.charAt(0) === '_' || aftrstr.charAt(0) === '-') ? 1: 0);
        let finaftrstr = aftrstr.substring(fnindx);
        console.log("finaftrstr = " + finaftrstr);

        //this must be an integer
        this.letMustBeAnIntegerOnly(finaftrstr, "finaftrstr");
        let mynum = Number(finaftrstr);
        console.log("mynum = " + mynum);

        //now we need to get the message from the sheet...
        //we have the message number that was the mynum from above...
        const mdatobj = this.getMyDataInfoObjConsts();
        const msgdatrwobj = this.getMyMessageRowDataObjectFromInfoDatObjAndNumString(finaftrstr, mdatobj);
        console.log("mdatobj = ", mdatobj);
        console.log("msgdatrwobj = ", msgdatrwobj);
        
        if (msgdatrwobj["messagerowisnotvalid"])
        {
          //we need to handle the major problem here...
          const merrmsgd = "the message row index must be valid (starts at 1), but it was not!";
          this.throwAndOrAlertTheError(myalerterrs, merrmsgd);
        }
        //else;//do nothing

        //msgrwi gets extracted from the message data object
        //the subjects col index will be directly passed from the parameter unchanged
        //the name val will come from the parameter as well
        //the message will come from the sheet, and the mydata array, but that needs a row and a col
        //we have the row from the msgrwi from the message data object
        //the column is defined in the other data object

        //it could be a message or a subject
        //so the column we need to use keys are: "msgscoli" or "sbjcoli"
        
        const mynwmsgrwi = msgdatrwobj["msgrwi"];
        const usemsgvnms = this.areAllItemsOfArrAInArrB([allmsgandsbjvarnms[n]], msgvarnms);
        const mymsgky = (usemsgvnms ? "msgscoli" : "sbjcoli");
        const cmsgrwi = mymsgrwis[mymsgrwis.length - 1];
        console.log("usemsgvnms = " + usemsgvnms);
        console.log("origmsgismsg = " + origmsgismsg);
        console.log("origmsgissbj = " + origmsgissbj);
        console.log("mymsgky = " + mymsgky);
        console.log("mysbjscoli = " + mysbjscoli);
        console.log("mymsgrwis = ", mymsgrwis);
        console.log("cmsgrwi = " + cmsgrwi);
        console.log("mynwmsgrwi = " + mynwmsgrwi);

        //we do not want a -> a, nor b -> b.... a -> b is allowed; but b -> a is not.
        //rule 1: a cannot be in a
        //rule 2: using b, it cannot be both because if a message is in the subject that is too long.
        //if the message is inside of the message error
        //if the subject or the message is inside of the subject error
        //the message is a test message (IE NOT ON THE SHEET AT ALL), we can refer to a message or a subject.
        //if the message claims to be a test, but is not, then an infinite loop is possible.
        
        //...
        //This is message 2 <MESSAGE_NUMBER_6>
        //...
        //This is message 4 <MESSAGE_NUMBER_2>
        //...
        //This is test 6 <MESSAGE_NUMBER_4>
        //NOTE IT DOES NOT MATTER IF MESSAGES OR SUBJECTS
        //THE SUBJECTS ARE NOT ALLOWED TO HAVE MESSAGES OR OTHER SUBJECTS IN THEM.

        //current vlist is empty or null ...
        //call the function with message 2 start vlist with 2;
        //call the function with message 6 add message 6 to vlist vlist now has 2, 6 into it
        //call the function with message 4 add message 4 to vlist vlist now has 2, 6, 4
        //call the function with message 2 program should crash because 2 is already on the vlist...

        const merrmsge = "the message variable is not allowed to be used on the same row because you do not " +
          "want the message to refer to itself, and you do not want the subject to include the message!";
        const merrmsgf = "the subject variable cannot be used inside of the subject, but it can be used " +
          "inside of the message on the same row!";
        if (mynwmsgrwi === cmsgrwi)
        {
          if (usemsgvnms)
          {
            //the message variable was used (this cannot be used in the message, nor should it be in the subject)
            if (origmsgismsg || origmsgissbj)
            {
              //throw new Error(merrmsge);
              this.throwAndOrAlertTheError(myalerterrs, merrmsge);
            }
            //else;//do nothing the error does not apply to test messages
          }
          else
          {
            //the subject variable was used (this can be used inside of the message, but not in the subject)
            if (origmsgissbj)
            {
              //throw new Error(merrmsgf);
              this.throwAndOrAlertTheError(myalerterrs, merrmsgf);
            }
            //else;//do nothing the error does not apply to test messages
          }
        }
        //else;//do nothing

        let addit = true;
        for (let i = 0; i < mymsgrwis.length; i++)
        {
          if (mymsgrwis[i] === mynwmsgrwi)
          {
            addit = false;
            break;
          }
        }
        console.log("addit = " + addit);

        if (addit);
        else
        {
          //we need to print the indexes...
          //row nums are plus 1.
          //then we can transform to message num...
          const msgrownums = mymsgrwis.map((val) => val + 1);
          const msgnums = this.getMessageNumsFromRowIndexesFromDatObj(mymsgrwis, mdatobj);
          const merrmsgg = "message loop detected on the following row nums: [" + msgrownums.join(", ") +
            "], and the message numbers are: [" + msgnums.join(", ") + "]! You cannot have messages that " +
            "refer to each other in a loop!";
          //throw new Error(merrmsgg);
          this.throwAndOrAlertTheError(myalerterrs, merrmsgg);
        }

        let mynwmsgrwindxs = mymsgrwis.filter((mval) => !(mval < 0 || mxrow - 1 < mval));
        mynwmsgrwindxs.push(mynwmsgrwi);
        console.log("mynwmsgrwindxs = ", mynwmsgrwindxs);

        console.log("CALLING THE METHOD AGAIN NOW, BUT SUBSTITUTING THE OTHER MESSAGE FOR THE VARIABLE HERE!");
        //needs the new message row indexes...
        const myomsg = this.getFinalMessageContent(mydata[mynwmsgrwi][mdatobj[mymsgky]], nmval, origmsgtp,
          mysbjscoli, mynwmsgrwindxs);
        console.log("myomsg = mval = " + myomsg);

        console.log("CALLING THE METHOD AGAIN NOW:");
        //needs the old message row indexes...
        const nwmsg = origmsg.substring(0, nmi) + myomsg + origmsg.substring(nmi + fulvarnm.length);
        return this.getFinalMessageContent(nwmsg, nmval, origmsgtp, mysbjscoli, mymsgrwis);
      }
    }
  }//end of n for loop


  //section 2:
  //this code gets the next date for the next weekday
  //like the date for next sunday for example from the current date


  for (let n = 0; n < nxtvars.length; n++)
  {
    console.log("nxtvars[" + n + "] = " + nxtvars[n]);
    //console.log("nxtvars[" + n + "].length = " + nxtvars[n].length);

    const nmi = origmsg.indexOf("<" + nxtvars[n] + "_");
    if (nmi < 0 || origmsg.length - 1 < nmi);
    else
    {
      let evari = -1;
      for (let i = nmi + 2 + nxtvars[n].length; i < origmsg.length; i++)
      {
        if (origmsg.charAt(i) === '>')
        {
          evari = i;
          break;
        }
        else if (origmsg.charAt(i) === '_' || this.myIsAlpha(origmsg.charAt(i)));
        else break;
      }//end of i for loop
      console.log("evari = " + evari);

      if (evari < 0 || origmsg.length - 1 < evari);
      else
      {
        //found the variable....
        const fvarnm = origmsg.substring(nmi, evari + 1);
        const ptaftrundrscr = origmsg.substring(nmi + 2 + nxtvars[n].length, evari);
        const mdyswk = this.getAllOptionsForMyDaysOfTheWeek();
        //const finmydyswk = this.getOneDArrayOfAllOptionsForMyDaysOfTheWeek();
        const ndis = nodayvars.map((ndvar) => fvarnm.indexOf("_" + ndvar + ">"));
        const finndvars = nodayvars.filter((ndvar, vi) => (0 < ndis[vi] && ndis[vi] < fvarnm.length));
        const finndis = ndis.filter((ndvali, vi) => (0 < ndvali && ndvali < fvarnm.length));
        const findayundrscrvars = this.combineTwoLists(finndvars, maftrntvars);
        console.log("fvarnm = " + fvarnm);
        console.log("ptaftrundrscr = " + ptaftrundrscr);
        console.log("ndis = ", ndis);
        console.log("finndis = ", finndis);
        console.log("finndvars = ", finndvars);
        console.log("findayundrscrvars = ", findayundrscrvars);
        console.log("mdyswk = ", mdyswk);
        //console.log("finmydyswk = ", finmydyswk);

        
        //if the part after the underscore and to > matches a week day,
        //then this is a variable and that is the day
        //then we can use the date class to determine what day that is...
        let mywdkdi = -1;//su0,mo1,tu2,we3,th4,fr5,sa6
        let undpti = -1;
        let bkouter = false;
        for (let k = 0; k < mdyswk.length; k++)
        {
          for (let c = 0; c < mdyswk[0].length; c++)
          {
            if (ptaftrundrscr === mdyswk[k][c])
            {
              mywdkdi = k;
              bkouter = true;
              break;
            }
            else
            {
              for (let i = 0; i < findayundrscrvars.length; i++)
              {
                if (ptaftrundrscr === mdyswk[k][c] + "_" + findayundrscrvars[i])
                {
                  undpti = i;
                  mywdkdi = k;
                  bkouter = true;
                  break;
                }
              }
              if (bkouter) break;
            }
          }//end of c for loop
          if (bkouter) break;
        }//end of k for loop
        console.log("mywdkdi = " + mywdkdi);
        console.log("undpti = " + undpti);

        if (mywdkdi < 0 || 6 < mywdkdi);
        else
        {
          //we know what date.getDay() we want to return... (mywdkdi)
          //we can get the current day of the week
          //from there we can compute the difference...
          //we can figure out in days how many we need.
          //then we will need to know if the month changes and how many days are in said month...
          
          const daystr = "" + mdyswk[mywdkdi][1];
          const findaystr = (this.isValEmptyNullOrUndefined(finndvars) ? daystr + " ": "");
          const merrmsgh = "illegal value found and used here for the index k!";
          let dtimeli = -1;
          bkouter = false;
          for (let k = 0; k < 6; k++)
          {
            let mlist = null;
            if (k === 0) mlist = finndvars;//this.twoWordComboGen("no", "day");
            else if (k === 1) mlist = mrningvars;//["morning", "morn", "MORN", "MORNING"];
            else if (k === 2) mlist = middayvars;//this.twoWordComboGen("mid", "day");
            else if (k === 3) mlist = aftrnoonvars;//["afternoon", "AFTERNOON"];
            else if (k === 4) mlist = evningvars;//["eve", "EVE", "eventide", "EVENTIDE", "evening", "EVENING"];
            else if (k === 5) mlist = ntvars;//["night", "NIGHT"];
            else
            {
              //throw new Error(merrmsgh);
              this.throwAndOrAlertTheError(myalerterrs, merrmsgh);
            }
            
            for (let i = 0; i < mlist.length; i++)
            {
              if (findayundrscrvars[undpti] === mlist[i])
              {
                dtimeli = k;
                bkouter = true;
                break;
              }
            }//end of i for loop
            if (bkouter) break;
          }//end of k for loop
          console.log("dtimeli = " + dtimeli);

          //Sunday, 8-1-2025
          //Sunday evening, 8-1-2025
          //dmrnanntstr means d_morning_afternoon_night_string
          const dmrnanntstr = ((dtimeli < 1 || 5 < dtimeli) ? "" : dtoptptvars[dtimeli] + ", ");
          let myfindayandmnantstr = null;
          if (this.isValEmptyNullOrUndefined(findaystr)) myfindayandmnantstr = "";
          else
          {
            if (this.isValEmptyNullOrUndefined(dmrnanntstr))
            {
              myfindayandmnantstr = "" + findaystr.substring(0, findaystr.length - 1) + "," +
                findaystr.substring(findaystr.length - 1);
            }
            else myfindayandmnantstr = "" + findaystr + dmrnanntstr;
          }
          //const myfindayandmnantstr = "" + findaystr + dmrnanntstr;
          console.log("dmrnanntstr = " + dmrnanntstr);
          console.log("myfindayandmnantstr = " + myfindayandmnantstr);


          const cdate = new Date();
          //const cdate = new Date(2025, 9, 31);
          let daydiff = mywdkdi - cdate.getDay();
          if (daydiff < 1) daydiff += 7;
          console.log(cdate);
          console.log("daydiff = " + daydiff);
          
          const nwdayofmnthnum = cdate.getDate() + daydiff;
          const nmdysinmnth = this.getNumDaysInTheMonth(cdate.getMonth(), cdate.getFullYear());
          console.log("nwdayofmnthnum = " + nwdayofmnthnum);
          console.log("nmdysinmnth = " + nmdysinmnth);

          
          let mval = null;
          if (nmdysinmnth < nwdayofmnthnum)
          {
            //the number of days in the month is less than the new day number
            //this means it will be in the next month
            const findaydiff = nwdayofmnthnum - nmdysinmnth;
            const nwmnthnum = cdate.getMonth() + 1;
            console.log("nwmnthnum = " + nwmnthnum);
            console.log("findaydiff = " + findaydiff);

            const advyrnm = (11 < nwmnthnum);
            const finmnthnum = (advyrnm ? 0 : nwmnthnum);
            const nwyrnum = (advyrnm ? cdate.getFullYear() + 1 : cdate.getFullYear());
            console.log("advyrnm = " + advyrnm);
            console.log("finmnthnum = " + finmnthnum);
            console.log("nwyrnum = " + nwyrnum);

            mval = "" + myfindayandmnantstr + (finmnthnum + 1) + "/" + findaydiff + "/" + nwyrnum;
          }
          else
          {
            mval = "" + myfindayandmnantstr + (cdate.getMonth() + 1) + "/" + nwdayofmnthnum + "/" +
              cdate.getFullYear();
          }
          console.log("mval = " + mval);

          console.log("CALLING THE METHOD AGAIN NOW:");
          const nwmsg = origmsg.substring(0, nmi) + mval + origmsg.substring(nmi + fvarnm.length);
          return this.getFinalMessageContent(nwmsg, nmval, origmsgtp, mysbjscoli, mymsgrwis);
        }
      }
    }
  }//end of n for loop


  //section 3:
  //now handle the non-programmed or user variables
  //also handles the return value if not found or not present.
  
  const remvars = this.getPossibleVariableNamesAndLocations(origmsg);
  console.log("origmsg = " + origmsg);
  console.log("remvars = ", remvars);
  console.log("mymsgrwis = ", mymsgrwis);

  
  const mymsgrwi = mymsgrwis[mymsgrwis.length - 1];
  if (this.isValEmptyNullOrUndefined(remvars) || (mymsgrwi < 0 || mxrow - 1 < mymsgrwi))
  {
    return origmsg;//the name was not present...
  }
  else
  {
    //need to see if the user has provided a way to parse said vars...
    let cntnondf = 0;
    for (let n = 0; n < remvars.length; n++)
    {
      console.log("remvars[" + n + "][vnmisprogramdefined] = " + remvars[n]["vnmisprogramdefined"]);
      
      if (remvars[n]["vnmisprogramdefined"]);
      else
      {
        cntnondf++;
        for (let c = mysbjscoli + 1; c < mxcol; c++)
        {
          if (this.isValEmptyNullOrUndefined(mydata[mymsgrwi][c]));
          else
          {
            let cvnmstr = "" + remvars[n]["varnm"];
            if (mydata[mymsgrwi][c].indexOf("<" + cvnmstr + ">") === 0)
            {
              //found it, handle it here, then break out of it...
              let mystr = "" + mydata[mymsgrwi][c];
              console.log("FOUND IT NEED TO DO SOMETHING HERE!");
              console.log("mydata[" + mymsgrwi + "][" + c + "] = mystr = " + mydata[mymsgrwi][c]);
              
              let nmi = remvars[n]["si"];
              let nvalstr = mystr.substring(cvnmstr.length + 2 + 2);
              console.log("nmi = " + nmi);
              console.log("nvalstr = " + nvalstr);
              
              //do the replacement here then make a recursive call.
              console.log("CALLING THE METHOD AGAIN NOW:");
              const nwmsg = origmsg.substring(0, nmi) + nvalstr + origmsg.substring(nmi + cvnmstr.length + 2);
              return this.getFinalMessageContent(nwmsg, nmval, origmsgtp, mysbjscoli, mymsgrwis);
              //break;
            }
            //else;//do nothing
          }
        }//end of c for loop
      }
    }//end of n for loop
    console.log("cntnondf = " + cntnondf);

    const merrmsgi = "somehow all of the program defined variables were not handled, but they should have been!";
    const merrmsgj = "DUE TO REPLACING IT ABOVE, IT SHOULD HAVE ALREADY RETURNED, BUT IT DID NOT! The user " +
      "did not define a variable, or did not include the correct way to process it!";
    if (cntnondf < 1)
    {
      //throw new Error(merrmsgi);
      this.throwAndOrAlertTheError(myalerterrs, merrmsgi);
    }
    else
    {
      //throw new Error(merrmsgj);
      this.throwAndOrAlertTheError(myalerterrs, merrmsgj);
    }
  }
}

function getMyFinalMessageFromNamesTypeAndRow(msgrwi, nmval, origmsgtp, mysbjscoli, mymsgscoli)
{
  //if the message type is other and the therefore the row is -1, then we error out.
  //otherwise there was not a point in using this method...
  this.letMustBeAnIntegerOnly(msgrwi, "msgrwi");
  this.letMustBeAnIntegerOnly(mymsgscoli, "mymsgscoli");
  this.letMustBeAnIntegerOnly(mysbjscoli, "mysbjscoli");
  const merrmsga = "the indexes msgrwi, mymsgscoli, mysbjscoli must all be at least zero, " +
    "and the rows must be less than the max row and the cols must be less than the max col, but at " +
    "least one of these was not!";
  if ((msgrwi < 0 || mxrow - 1 < msgrwi) ||
    (mymsgscoli < 0 || mxcol - 1 < mymsgscoli) || (mysbjscoli < 0 || mxcol - 1 < mysbjscoli))
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  console.log("INSIDE OF GET-MY-FINAL-MESSAGE-FROM-NAMES-TYPE-AND-ROW METHOD!");
  console.log("msgrwi = " + msgrwi);
  console.log("nmval = " + nmval);
  console.log("origmsgtp = " + origmsgtp);
  console.log("mysbjscoli = " + mysbjscoli);
  console.log("mymsgscoli = " + mymsgscoli);

  const msgvarnms = this.getMessageVarNames();
  const sbjvarnms = this.getSubjectVarNames();
  const finmsgtp = (this.areAllItemsOfArrAInArrB([origmsgtp], msgvarnms) ? "MESSAGE" :
    (this.areAllItemsOfArrAInArrB([origmsgtp], sbjvarnms) ? "SUBJECT" : "OTHER"));
  //console.log("msgvarnms = ", msgvarnms);
  //console.log("sbjvarnms = ", sbjvarnms);
  console.log("finmsgtp = " + finmsgtp);

  if (finmsgtp === "OTHER")
  {
    const merrmsgb = "the other message type is not supported for this method, the message string must come " +
      "from the spreadsheet, but the other type does not!";
    //throw new Error(merrmsgb);
    this.throwAndOrAlertTheError(myalerterrs, merrmsgb);
  }
  const mci = (finmsgtp === "MESSAGE" ? mymsgscoli : mysbjscoli);
  
  //now check to make sure the row is valid here...
  //attempt to error check the message row indexes here...
  const msgnums = this.getMessageNumsFromRowIndexesFromDatObjMain([msgrwi]);
  this.letMustNotBeEmpty(msgnums, "msgnums");
  if (msgnums.length === 1);
  else
  {
    const merrmsgc = "the message nums must have at least one number on it, but it did not, so the message " +
      "row index was not valid!";
    //throw new Error(merrmsgc);
    this.throwAndOrAlertTheError(myalerterrs, merrmsgc);
  }
  //console.log("msgnums = ", msgnums);

  return this.getFinalMessageContent(mydata[msgrwi][mci], nmval, finmsgtp, mysbjscoli, [msgrwi]);
}
function getMyFinalMessageOrSubjectFromNamesForRow(msgrwi, nmval, usemsg, mysbjscoli, mymsgscoli)
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const finmsgtp = (usemsg ? "MESSAGE" : "SUBJECT");
  return this.getMyFinalMessageFromNamesTypeAndRow(msgrwi, nmval, finmsgtp, mysbjscoli, mymsgscoli);
}
function getMyFinalMessageFromNamesForRow(msgrwi, nmval, mysbjscoli, mymsgscoli)
{
  return this.getMyFinalMessageOrSubjectFromNamesForRow(msgrwi, nmval, true, mysbjscoli, mymsgscoli);
}
function getMyFinalSubjectFromNamesForRow(msgrwi, nmval, mysbjscoli, mymsgscoli)
{
  return this.getMyFinalMessageOrSubjectFromNamesForRow(msgrwi, nmval, false, mysbjscoli, mymsgscoli);
}

function getMyFinalMessageOrSubjectFromNamesForRowFromDatObj(msgrwi, nmval, usemsg,
  mdatobj=this.getMyDataInfoObjConsts())
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const rkys = ["msgscoli", "sbjcoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyFinalMessageOrSubjectFromNamesForRow(msgrwi, nmval, usemsg, mdatobj[rkys[1]], mdatobj[rkys[0]]);
}
function getMyFinalMessageFromNamesForRowFromDatObj(msgrwi, nmval, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObj(msgrwi, nmval, true, mdatobj);
}
function getMyFinalSubjectFromNamesForRowFromDatObj(msgrwi, nmval, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObj(msgrwi, nmval, false, mdatobj);
}

function getMyFinalMessageOrSubjectFromNamesFromDatObj(nmval, usemsg, mdatobj=this.getMyDataInfoObjConsts())
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const rkys = ["nmcoli", "mnhdri", "msgscoli", "sbjcoli", "msgsntnmbrcell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");

  const msgrwdatobj = this.getMyMessageRowDataObjectFromInfoDatObj(mdatobj);
  console.log("INSIDE OF GET-MY-FINAL-MESSAGE-OR-SUBJECT-FROM-NAMES-FROM-DAT-OBJ METHOD!");
  console.log("msgrwdatobj = ", msgrwdatobj);
  
  const orkys = ["mymsgnum", "msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, orkys, "msgrwdatobj");

  //const mnum = msgrwdatobj[orkys[0]];
  const msgrw = msgrwdatobj[orkys[1]];
  const msgrwisinvld = msgrwdatobj[orkys[2]];
  //console.log("mnum = " + mnum);
  console.log("msgrw = " + msgrw);
  console.log("msgrwisinvld = " + msgrwisinvld);

  if (msgrwisinvld) throw new Error("the message row must be valid, but it was not!");
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObj(msgrw, nmval, usemsg, mdatobj);
}
function getMyFinalMessageFromNamesFromDatObj(nmval, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectFromNamesFromDatObj(nmval, true, mdatobj);
}
function getMyFinalSubjectFromNamesFromDatObj(nmval, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectFromNamesFromDatObj(nmval, false, mdatobj);
}

function getMyFinalMessageOrSubjectFromNamesForRowFromDatObjMain(msgrwi, nmval, usemsg)
{
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObj(msgrwi, nmval, usemsg,
    this.getMyDataInfoObjConsts());
}
function getMyFinalMessageFromNamesForRowFromDatObjMain(msgrwi, nmval)
{
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObjMain(msgrwi, nmval, true);
}
function getMyFinalSubjectFromNamesForRowFromDatObjMain(msgrwi, nmval)
{
  return this.getMyFinalMessageOrSubjectFromNamesForRowFromDatObjMain(msgrwi, nmval, false);
}

function getMyFinalMessageOrSubjectFromNamesFromDatObjMain(nmval, usemsg)
{
  return this.getMyFinalMessageOrSubjectFromNamesFromDatObj(nmval, usemsg, this.getMyDataInfoObjConsts());
}
function getMyFinalMessageFromNamesFromDatObjMain(nmval)
{
  return this.getMyFinalMessageOrSubjectFromNamesFromDatObjMain(nmval, true);
}
function getMyFinalSubjectFromNamesFromDatObjMain(nmval)
{
  return this.getMyFinalMessageOrSubjectFromNamesFromDatObjMain(nmval, false);
}


//this function passes in TEST_NAME for name
//this also passes in the msgs_col_index and subjects_col_index and the message row index as parameters
function getMyFinalMessageForRowWithTestName(msgrw, mymsgscoli, mysbjscoli, origmsgtp)
{
  this.letMustBeAnIntegerOnly(msgrw, "msgrw");
  this.letMustBeAnIntegerOnly(mymsgscoli, "mymsgscoli");
  this.letMustBeAnIntegerOnly(mysbjscoli, "mysbjscoli");
  const merrmsga = "the indexes msgrw, mymsgscoli, mysbjscoli must all be at least zero, " +
    "and the rows must be less than the max row and the cols must be less than the max col, but at " +
    "least one of these was not!";
  if ((msgrw < 0 || mxrow - 1 < msgrw) ||
    (mymsgscoli < 0 || mxcol - 1 < mymsgscoli) || (mysbjscoli < 0 || mxcol - 1 < mysbjscoli))
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  return this.getFinalMessageContent(mydata[msgrw][mymsgscoli], "TEST_NAME", origmsgtp, mysbjscoli, [msgrw]);
}
function getMyFinalMessageOrSubjectForRowWithTestNameFromDatObj(msgrw, usemsg,
  mdatobj=this.getMyDataInfoObjConsts())
{
  this.letMustBeBoolean(usemsg, "usemsg");
  const rkys = ["msgscoli", "sbjcoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyFinalMessageForRowWithTestName(msgrw, (usemsg ? mdatobj[rkys[0]] : mdatobj[rkys[1]]),
    mdatobj[rkys[1]], (usemsg ? "MESSAGE" : "SUBJECT"));
}
function getMyFinalMessageForRowWithTestNameMain(msgrw)
{
  return this.getMyFinalMessageForRowWithTestNameFromDatObj(msgrw, true, this.getMyDataInfoObjConsts());
}
function getMyFinalSubjectForRowWithTestNameMain(msgrw)
{
  return this.getMyFinalMessageForRowWithTestNameFromDatObj(msgrw, false, this.getMyDataInfoObjConsts());
}

function getMyFinalMessageOrSubjectFromSheetWithTestNameAndDatObj(usemsg, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "msgscoli", "sbjcoli", "msgsntnmbrcell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  const msgrwdatobj = this.getMyMessageRowDataObjectFromCell(mdatobj[rkys[0]], mdatobj[rkys[1]], mdatobj[rkys[3]]);
  console.log("INSIDE OF GET-MY-FINAL-MESSAGE-OR-SUBJECT-FROM-SHEET-WITH-TEST-NAME-AND-DAT-OBJ METHOD!");
  console.log("msgrwdatobj = ", msgrwdatobj);

  const omrkys = ["mymsgnum", "msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, omrkys, "msgrwdatobj");
  const msgrwi = (msgrwdatobj[omrkys[2]] ? -1 : msgrwdatobj[omrkys[1]]);
  return this.getMyFinalMessageOrSubjectForRowWithTestNameFromDatObj(msgrwi, usemsg, mdatobj);
}
function getMyFinalMessageOrSubjectFromSheetWithTestNameMain(usemsg)
{
  return this.getMyFinalMessageOrSubjectFromSheetWithTestNameAndDatObj(usemsg, this.getMyDataInfoObjConsts());
}
function getMyFinalMessageFromSheetWithTestNameMain()
{
  return this.getMyFinalMessageOrSubjectFromSheetWithTestNameMain(true);
}
function getMyFinalSubjectFromSheetWithTestNameMain()
{
  return this.getMyFinalMessageOrSubjectFromSheetWithTestNameMain(false);
}
function getMyFinalMessageFromSheetWithTestNameForUser()
{
  this.alertResultsToUser(this.getMyFinalMessageFromSheetWithTestNameMain());
}
function getMyFinalSubjectFromSheetWithTestNameForUser()
{
  this.alertResultsToUser(this.getMyFinalSubjectFromSheetWithTestNameMain());
}


//NOTE: for the mymsgscoli you can pass this in or the subject row index here
function getMyFinalMessageForRow(r, mynmcli, msgrw, mymsgscoli, mysbjscoli, origmsgtp)
{
  this.letMustBeAnIntegerOnly(r, "r");
  this.letMustBeAnIntegerOnly(mynmcli, "mynmcli");
  this.letMustBeAnIntegerOnly(msgrw, "msgrw");
  this.letMustBeAnIntegerOnly(mymsgscoli, "mymsgscoli");
  this.letMustBeAnIntegerOnly(mysbjscoli, "mysbjscoli");
  const merrmsga = "the indexes r, mynmcli, msgrw, mymsgscoli, mysbjscoli must all be at least zero, " +
    "and the rows must be less than the max row and the cols must be less than the max col, but at " +
    "least one of these was not!";
  if ((r < 0 || mxrow - 1 < r) || (mynmcli < 0 || mxcol - 1 < mynmcli) || (msgrw < 0 || mxrow - 1 < msgrw) ||
    (mymsgscoli < 0 || mxcol - 1 < mymsgscoli) || (mysbjscoli < 0 || mxcol - 1 < mysbjscoli))
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  //console.log(mydata[r]);
  
  //attempt to error check the message row indexes here...
  const msgnums = this.getMessageNumsFromRowIndexesFromDatObjMain([msgrw]);
  this.letMustNotBeEmpty(msgnums, "msgnums");
  if (msgnums.length === 1);
  else
  {
    const merrmsgb = "the message nums must have at least one number on it, but it did not, so the message " +
      "row index was not valid!";
    //throw new Error(merrmsgb);
    this.throwAndOrAlertTheError(myalerterrs, merrmsgb);
  }
  //console.log("msgnums = ", msgnums);

  return this.getFinalMessageContent(mydata[msgrw][mymsgscoli], mydata[r][mynmcli], origmsgtp,
    mysbjscoli, [msgrw]);
}
function getFinalMessageForRowViaDatObj(r, msgrw, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["nmcoli", "msgscoli", "sbjcoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyFinalMessageForRow(r, mdatobj[rkys[0]], msgrw, mdatobj[rkys[1]], mdatobj[rkys[2]], "MESSAGE");
}
function getFinalMessageForRowMain(r, msgrw)
{
  return this.getFinalMessageForRowViaDatObj(r, msgrw, this.getMyDataInfoObjConsts());
}

//may return null as a legal value in this case no message should be sent
//this function pulls the message number from the sheet from the given cell (mymsgsntnmbrcell)
//then it calls the above methods
//NOTE: for the mymsgscoli you can pass this in or the subject row index here
function getMyFinalMessageForRowFromSheet(r, mynmcli, mnhdrwi, mymsgscoli, mymsgsntnmbrcell, mysbjscoli)
{
  //message number to be sent is saved in cell B2 (mymsgsntnmbrcell)
  //the above value starts at 0 for no message to be sent at all.
  //from the header row index we add 1 to get the messages start row index.
  //msri = mhdrwi + 1;
  //finmsgri = msri + mnum - 1;
  //finmsgri = mhdrwi + mnum;
  
  this.letMustBeAnIntegerOnly(r, "r");
  this.letMustBeAnIntegerOnly(mynmcli, "mynmcli");
  this.letMustBeAnIntegerOnly(mnhdrwi, "mnhdrwi");
  this.letMustBeAnIntegerOnly(mymsgscoli, "mymsgscoli");
  this.letMustBeAnIntegerOnly(mysbjscoli, "mysbjscoli");
  const merrmsga = "the indexes r, mynmcli, mnhdrwi, mymsgscoli, mysbjscoli must all be at least zero, " +
    "and the rows must be less than the max row and the cols must be less than the max col, but at least " +
    "one of these was not!";
  if ((r < 0 || mxrow - 1 < r) || (mynmcli < 0 || mxcol - 1 < mynmcli) || (mnhdrwi < 0 || mxrow - 1 < mnhdrwi) ||
    (mymsgscoli < 0 || mxcol - 1 < mymsgscoli) || (mysbjscoli < 0 || mxcol - 1 < mysbjscoli))
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  
  const msgrwdatobj = this.getMyMessageRowDataObjectFromCell(mnhdrwi, mymsgscoli, mymsgsntnmbrcell);
  console.log("INSIDE OF GET-MY-FINAL-MESSAGE-FOR-ROW-FROM-SHEET METHOD!");
  console.log("msgrwdatobj = ", msgrwdatobj);
  
  const rkys = ["mymsgnum", "msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, rkys, "msgrwdatobj");

  //const mnum = msgrwdatobj[rkys[0]];
  const msgrw = msgrwdatobj[rkys[1]];
  const msgrwisinvld = msgrwdatobj[rkys[2]];
  //console.log("mnum = " + mnum);
  console.log("msgrw = " + msgrw);
  console.log("msgrwisinvld = " + msgrwisinvld);

  if (msgrwisinvld) return null;
  //if the messages col is the subjects col index, then using subjects; otherwise using messages
  const usesbj = (mysbjscoli === mymsgscoli);
  const msgtp = (usesbj ? "SUBJECT" : "MESSAGE");
  return this.getMyFinalMessageForRow(r, mynmcli, msgrw, mymsgscoli, mysbjscoli, msgtp);
}

function getMyFinalMessageOrSubjectForRowFromSheetViaDatObj(r, usemsg, mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["nmcoli", "mnhdri", "msgscoli", "sbjcoli", "msgsntnmbrcell"];
  this.letMustBeBoolean(usemsg, "usemsg");
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.getMyFinalMessageForRowFromSheet(r, mdatobj[rkys[0]], mdatobj[rkys[1]],
    (usemsg ? mdatobj[rkys[2]] : mdatobj[rkys[3]]), mdatobj[rkys[4]], mdatobj[rkys[3]]);
}
function getMyFinalMessageForRowFromSheetViaDatObj(r, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectForRowFromSheetViaDatObj(r, true, mdatobj);
}
function getMyFinalSubjectForRowFromSheetViaDatObj(r, mdatobj=this.getMyDataInfoObjConsts())
{
  return this.getMyFinalMessageOrSubjectForRowFromSheetViaDatObj(r, false, mdatobj);
}

function getMyFinalMessageOrSubjectForRowFromSheetMain(r, usemsg)
{
  return this.getMyFinalMessageOrSubjectForRowFromSheetViaDatObj(r, usemsg, this.getMyDataInfoObjConsts());
}
function getMyFinalMessageForRowFromSheetMain(r)
{
  return this.getMyFinalMessageOrSubjectForRowFromSheetMain(r, true);
}
function getMyFinalSubjectForRowFromSheetMain(r)
{
  return this.getMyFinalMessageOrSubjectForRowFromSheetMain(r, false);
}


function canSendAMessage(myhdrwi, myinccoli, mymsgcoli, mymsgsntnmbrcell)
{
  //message number to be sent is saved in cell B2 (mymsgsntnmbrcell)
  //const mynumstr = ss.getRange(mymsgsntnmbrcell).getValue();
  //this.letMustBeAnIntegerOnly(mynumstr, "mynumstr");
  this.letMustBeAnIntegerOnly(myhdrwi, "myhdrwi");
  this.letMustBeAnIntegerOnly(myinccoli, "myinccoli");
  this.letMustBeAnIntegerOnly(mymsgcoli, "mymsgcoli");
  //const mnum = Number(mynumstr);
  //const msgrw = myhdrwi + mnum;
  const merrmsga = "my includes col index must be at least zero and less than the max col, but it was not!";
  if (myinccoli < 0 || mxcol - 1 < myinccoli)
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }

  const msgrwdatobj = this.getMyMessageRowDataObjectFromCell(myhdrwi, mymsgcoli, mymsgsntnmbrcell);
  console.log("msgrwdatobj = ", msgrwdatobj);
  
  const rkys = ["mymsgnum", "msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, rkys, "msgrwdatobj");
  //throw new Error("NOT DONE YET NEED TO LOOK AT STUFF HERE...!");

  //const mnum = msgrwdatobj[rkys[0]];
  //const msgrw = msgrwdatobj[rkys[1]];
  const msgrwisinvld = msgrwdatobj[rkys[2]];
  //console.log("mnum = " + mnum);
  //console.log("msgrw = " + msgrw);
  console.log("msgrwisinvld = " + msgrwisinvld);

  if (msgrwisinvld) return false;
  const inclmxvrwi = this.getTheMaxValidRowIndexMain(myinccoli);
  for (let r = myhdrwi + 1; r < inclmxvrwi + 1 && r < mxrow; r++)
  {
    let myincvalstr = "" + mydata[r][myinccoli];
    this.letMustBeAnIntegerOnly(myincvalstr, "myincvalstr");
    let myincnum = Number(myincvalstr);
    if (myincnum === 1) return true;
  }
  return false;
}
function canSendAMessageViaDatObj(mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["mnhdri", "inccoli", "msgscoli", "msgsntnmbrcell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  return this.canSendAMessage(mdatobj[rkys[0]], mdatobj[rkys[1]], mdatobj[rkys[2]], mdatobj[rkys[3]]);
}
function canSendAMessageMain() { return this.canSendAMessageViaDatObj(this.getMyDataInfoObjConsts()); }
function canUserSendAMessage() { this.alertResultsToUser(this.canSendAMessageMain()); }


function areGroupNumbersValid(gpnumstr, eisvld=false)
{
  this.letMustBeBoolean(eisvld, "eisvld");
  if (this.isValEmptyNullOrUndefined(gpnumstr)) return eisvld;
  else
  {
    //split the string at the ,spc
    const mstrs = ("" + gpnumstr).split(", ");
    //console.log("gpnumstr = " + gpnumstr);
    //console.log("mstrs = ", mstrs);

    for (let n = 0; n < mstrs.length; n++)
    {
      if (this.isValEmptyNullOrUndefined(mstrs[n])) return false;
      else
      {
        for (let i = 0; i < mstrs[n].length; i++)
        {
          if (this.myIsDigit(mstrs[n].charAt(i)));
          else return false;
        }
      }
    }
    return true;
  }
}


//EMAIL ADDRESS VALIDATION
//must start with a letter,
//then it can have letters or numbers or . or _
//must be alpha numeric or . or _
//until the @ you can only have one of those
//then only one . after it and letters only
function isEmailAddressValid(mstr, isemptvld=false)
{
  this.letMustBeBoolean(isemptvld, "isemptvld");
  if (this.isValEmptyNullOrUndefined(mstr)) return isemptvld;  

  let atfnd = false;
  let dotfnd = false;
  for (let i = 0; i < mstr.length; i++)
  {
    if (i === 0)
    {
      if (this.myIsAlpha(mstr.charAt(0)));
      else return false;
    }
    else
    {
      if (atfnd)
      {
        if (this.myIsAlpha(mstr.charAt(i)));
        else if (mstr.charAt(i) === '.' && !dotfnd) dotfnd = true;
        else return false; 
      }
      else
      {
        if (this.myIsAlpha(mstr.charAt(i)) || this.myIsDigit(mstr.charAt(i)));
        else if (mstr.charAt(i) === '.' || mstr.charAt(i) === '_');
        else if (mstr.charAt(i) === '@' && !atfnd) atfnd = true;
        else return false;
      }
    }
  }//end of i for loop
  return true;
}


//NOTE: the data validation function(s) might change as cols are added to spreadsheet
//this is used to enforce data type.

function isValidData(mdatobj=this.getMyDataInfoObjConsts())
{
  //eml, nms, and inci mx on the cols must all be the same
  //msgs and sbjs mx on the cols must be the same
  //the include col must only have 0s or 1s on it same for the one for one cell (B1)
  //the message number cell (mymsgsntnmbrcell often B2) is a number that starts at 0 and is 0 or more
  
  //get the data from the object
  const rkys = ["mnhdri", "emlcoli", "nmcoli", "inccoli", "grpnumscoli", "msgscoli", "sbjcoli", "msgsntnmbrcell",
    "replyaddrcell", "incgrpnumscell", "attachmntscoli", "attchmntstpcoli", "bpssatmntswrncell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  
  const myhdri = mdatobj[rkys[0]];
  const myemlcoli = mdatobj[rkys[1]];
  const mynmscoli = mdatobj[rkys[2]];
  const myinci = mdatobj[rkys[3]];
  const mygrpnumscoli = mdatobj[rkys[4]];
  const mymsgscoli = mdatobj[rkys[5]];
  const mysbjscoli = mdatobj[rkys[6]];
  const mymsgsntnmbrcell = mdatobj[rkys[7]];
  const myrepaddrcell = mdatobj[rkys[8]];
  const myincgrpnumscell = mdatobj[rkys[9]];
  const myattchmntscoli = mdatobj[rkys[10]];
  const myattchmntstpcoli = mdatobj[rkys[11]];
  const mybpsatchmntscell = mdatobj[rkys[12]];
  //console.log("BEGIN CHECKING THE COL ROW MAXS HERE:");

  const mxemlvi = this.getTheMaxValidRowIndex(myemlcoli, myhdri, mymsgscoli);
  const mxnmsvi = this.getTheMaxValidRowIndex(mynmscoli, myhdri, mymsgscoli);
  const mxincvi = this.getTheMaxValidRowIndex(myinci, myhdri, mymsgscoli);
  const mxgrpnumscvi = this.getTheMaxValidRowIndex(mygrpnumscoli, myhdri, mymsgscoli);
  const mxatchmntsvi = this.getTheMaxValidRowIndex(myattchmntscoli, myhdri, mymsgscoli);
  const mxatchmntstpvi = this.getTheMaxValidRowIndex(myattchmntstpcoli, myhdri, mymsgscoli);
  if (mxemlvi === mxnmsvi && mxnmsvi === mxincvi && mxatchmntsvi === mxatchmntstpvi)
  {
    const mxmsgsvi = this.getTheMaxValidRowIndex(mymsgscoli, myhdri, mymsgscoli);
    const mxsbjsvi = this.getTheMaxValidRowIndex(mysbjscoli, myhdri, mymsgscoli);
    if (mxmsgsvi === mxsbjsvi)
    {
      //console.log("THE CORRECT AMOUNT OF DATA IS PRESENT! BEGIN CHECKING THE DATA IN THE CELLS HERE NOW:");

      const cellstocheck = ["B1", mymsgsntnmbrcell, mybpsatchmntscell];
      for (let i = 0; i < cellstocheck.length; i++)
      {
        this.letMustBeValidAOneNotation(cellstocheck[i], "cellstocheck[" + i + "]");
        let mytclval = ss.getRange(cellstocheck[i]).getValue();
        if (this.isValAnInteger(mytclval))
        {
          if (cellstocheck[i] === "B1" || cellstocheck[i] === mybpsatchmntscell)
          {
            let mytnum = Number(mytclval);
            if (mytnum === 0 || mytnum === 1);
            else return false;
          }
          //else;//do nothing
        }
        else return false;
      }
      //console.log("the one for one value is valid! BEGIN REPLY ADDRESS CELL CHECK:");

      this.letMustBeValidAOneNotation(myrepaddrcell, "myrepaddrcell");
      let myrpaddrclval = ss.getRange(myrepaddrcell).getValue();
      if (this.isEmailAddressValid(myrpaddrclval, true));
      else return false;
      //console.log("the reply address cell is valid! BEGIN EMAIL ADDRESS CHECKS:");

      for (let r = myhdri + 1; r < mxemlvi + 1 && r < mxrow; r++)
      {
        //console.log("mydata[" + r + "][" + myemlcoli + "] = " + mydata[r][myemlcoli]);
        if (this.isEmailAddressValid(mydata[r][myemlcoli], false));
        else return false;
      }
      //console.log("the email addresses are all valid! BEGIN GROUP NUMBER CHECKS:");
      
      //check the group number strings here
      this.letMustBeValidAOneNotation(myincgrpnumscell, "myincgrpnumscell");
      let mygrpnumsclvalstr = ss.getRange(myincgrpnumscell).getValue();
      if (this.areGroupNumbersValid(mygrpnumsclvalstr, true));
      else return false;
      //console.log("the include group number cell value is valid! CHECKING THE REMAINING GROUP NUMBERS:");

      for (let r = myhdri + 1; r < mxgrpnumscvi + 1 && r < mxrow; r++)
      {
        //console.log("mydata[" + r + "][" + mygrpnumscoli + "] = " + mydata[r][mygrpnumscoli]);
        if (this.isValAnInteger(mydata[r][mygrpnumscoli]))
        {
          let mytnum = Number(mydata[r][mygrpnumscoli]);
          if (mytnum < 0) return false;
          //else;//do nothing
        }
        else
        {
          let mytmpgrpnumsstr = mydata[r][mygrpnumscoli];
          if (this.areGroupNumbersValid(mytmpgrpnumsstr, false));
          else return false;
        }
      }
      //console.log("group numbers are valid! BEGIN CHECKING THE ATTACHMENTS TYPES COL NOW:");

      //validate the attachments type col
      for (let r = myhdri + 1; r < mxatchmntstpvi + 1 && r < mxrow; r++)
      {
        if (this.isValAnInteger(mydata[r][myattchmntstpcoli]))
        {
          let mytnum = Number(mydata[r][myattchmntstpcoli]);
          if (mytnum === 0 || mytnum === 1 || mytnum === 2);
          else return false;
        }
        else return false;
      }
      //console.log("the attachments type col values are valid! BEGIN CHECKING THE INCLUDE COL NOW:");

      //validate the include col
      for (let r = myhdri + 1; r < mxincvi + 1 && r < mxrow; r++)
      {
        if (this.isValAnInteger(mydata[r][myinci]))
        {
          let mytnum = Number(mydata[r][myinci]);
          if (mytnum === 0 || mytnum === 1);
          else return false;
        }
        else return false;
      }
      //console.log("the include col values are valid! ALL TESTS PASS!");
      return true;
    }
  }
  return false;
}
function isValidDataMain() { return this.isValidData(this.getMyDataInfoObjConsts()); }
function getForUserIsValidData() { this.alertResultsToUser(this.isValidDataMain()); }


function canSendAMessageAndIsValidData(mdatobj=this.getMyDataInfoObjConsts())
{
  return (this.isValidData(mdatobj) && this.canSendAMessageViaDatObj(mdatobj));
  // && 0 < MailApp.getRemainingDailyQuota()
}
function canSendAMessageAndIsValidDataMain()
{
  return this.canSendAMessageAndIsValidData(this.getMyDataInfoObjConsts());
}
function userCanSendAMessageAndIsValidData() { this.alertResultsToUser(this.canSendAMessageAndIsValidDataMain()); }


function printFileObjectsArray(myfileobjsarr)
{
  if (this.isValEmptyNullOrUndefined(myfileobjsarr)) console.log("the file objects array is empty or null!");
  else
  {
    console.log("there are " + myfileobjsarr.length + " files:");
    for (let i = 0; i < myfileobjsarr.length; i++)
    {
      let tempmfileobj = myfileobjsarr[i];
      console.log("" + (i + 1) + ". filename: ", tempmfileobj.getName());
      console.log("mimetype: " + tempmfileobj.getMimeType());
      let tempfldrs = tempmfileobj.getParents();
      while (tempfldrs.hasNext()) console.log(tempfldrs.next().getName());
      console.log("fileid: " + tempmfileobj.getId());
      console.log("fileurl: " + tempmfileobj.getUrl());
    }
  }
}

function printMyOptionsObject(mobj)
{
  if (this.isValNullOrUndefined(mobj)) console.log("the options object is null!");
  else
  {
    const mobjkys = Object.keys(mobj);
    console.log("mobjkys = ", mobjkys);
    
    mobjkys.forEach((ky) => {
      if (ky === "attachments")
      {
        //these can be handled differently
        console.log("NOW PRINTING OUT THE ATTACHMENTS ARRAY HERE:");
        let myattchmnts = mobj[ky];
        if (this.isValEmptyNullOrUndefined(myattchmnts)) console.log("the attachments array is empty or null!");
        else
        {
          console.log("there are " + myattchmnts.length + " files:");
          for (let i = 0; i < myattchmnts.length; i++)
          {
            let myattchmnt = myattchmnts[i];
            console.log("" + (i + 1) + ". filename: ", myattchmnt.getName());
            //console.log("myattchmnt = ", myattchmnt);
            let atcisfile = this.areAllItemsOfArrAInArrB(["getParents"], Object.keys(myattchmnt));
            if (atcisfile)
            {
              //this will likely be a file object then
              console.log("mimetype: " + myattchmnt.getMimeType());
              let tempfldrs = myattchmnt.getParents();
              while (tempfldrs.hasNext()) console.log(tempfldrs.next().getName());
              console.log("fileid: " + myattchmnt.getId());
              console.log("fileurl: " + myattchmnt.getUrl());
            }
            else
            {
              //this is a blob
              console.log("mimetype: " + myattchmnt.getContentType());
              console.log("isgoogletype: " + myattchmnt.isGoogleType());
            }
          }
        }
      }
      else console.log("mobj[" + ky + "] = ", mobj[ky]);
    });
  }
}

//MAY NOT BE DONE WITH GETTING FILE EXTENSIONS OR MIME TYPES OR BOTH
//MORE MAY EXIST AND MAY NEED TO BE ADDED TO ONE OR BOTH METHODS...

function getMicrosoftOrOpenMimeTypeForOtherMimeType(gdocmtp, usemsoft, useoldms=false)
{
  this.letMustNotBeEmpty(gdocmtp, "gdocmtp");
  this.letMustBeBoolean(usemsoft, usemsoft);
  this.letMustBeBoolean(useoldms, useoldms);
  
  //https://developers.google.com/workspace/drive/api/guides/ref-export-formats
  //https://developers.google.com/apps-script/reference/base/mime-type
  
  //MIMETYPES:
  //GOOGLE_APPS_SCRIPT -> JSON (application/vnd.google-apps.script+json), JAVASCRIPT
  //GOOGLE_DRAWINGS -> PDF, Images: BMP, GIF, JPEG, PNG, and SVG
  //GOOGLE_DOCS -> MICROSOFT_WORD, MICROSOFT_WORD_LEGACY, OPENDOCUMENT_TEXT, PDF, PLAIN_TEXT, and
  //RTF, EPUB, Markdown, and ZIP html stuff
  //GOOGLE_FORMS -> (unknown, cannot be converted to anything)
  //GOOGLE_SHEETS -> MICROSOFT_EXCEL, MICROSOFT_EXCEL_LEGACY, OPENDOCUMENT_TEXT, OPENDOCUMENT_SPREADSHEET,
  //-PDF, CSV, PLAIN_TEXT, and RTF
  //GOOGLE_SITES -> (unknown, cannot be converted to anything)
  //GOOGLE_SLIDES -> MICROSOFT_POWERPOINT, MICROSOFT_POWERPOINT_LEGACY, OPENDOCUMENT_TEXT, PDF, CSV,
  //-PLAIN_TEXT, and RTF and images first slide only: BMP, GIF, JPEG, PNG, SVG, OPENDOCUMENT_GRAPHICS
  //FOLDER -> (unknown, cannot be converted to anything)
  //SHORTCUT -> (unknown, cannot be converted to anything)
  //BMP (typically .bmp), GIF (typically .gif), JPEG (typically .jpg), PNG (typically .png), SVG (typically .svg).
  //PDF (typically .pdf).
  //CSV (typically .csv).
  //CSS (typically .css), HTML (typically .html), JAVASCRIPT (typically .js).
  //PLAIN_TEXT (typically .txt).
  //RTF (typically .rtf).
  //OPENDOCUMENT_GRAPHICS (typically .odg).
  //OPENDOCUMENT_PRESENTATION (typically .odp).
  //OPENDOCUMENT_SPREADSHEET (typically .ods).
  //OPENDOCUMENT_TEXT (typically .odt).
  //MICROSOFT_EXCEL (typically .xlsx).
  //MICROSOFT_EXCEL_LEGACY (typically .xls).
  //MICROSOFT_POWERPOINT (typically .pptx).
  //MICROSOFT_POWERPOINT_LEGACY (typically .ppt).
  //MICROSOFT_WORD (typically .docx).
  //MICROSOFT_WORD_LEGACY (typically .doc).
  //ZIP
  //GOOGLE_VIDS or GOOGLE_VIDEOS -> MP4 (application/mp4)
  //some others are not included on this list...
  //MP4, JSON, markdown, EPUB, TABSV

  const tpsreqconv = [MimeType.GOOGLE_DOCS, MimeType.GOOGLE_SHEETS, MimeType.GOOGLE_SLIDES,
    MimeType.GOOGLE_DRAWINGS, MimeType.GOOGLE_APPS_SCRIPT, MimeType.GOOGLE_VIDEOS];

  //const tpsnoconv = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //  "application/vnd.oasis.opendocument.text",
  //"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  //  "application/vnd.oasis.opendocument.presentation", "application/pdf", "image/jpeg", "image/png",
  //  "image/svg+xml", "application/vnd.google-apps.script+json", "application/mp4",
  //  "text/plain", "application/zip", "text/csv", "text/tab-separated-values", "application/rtf",
  //  "application/zip", "application/epub+zip", "text/markdown"];
  
  //not sure if the mimetype is valid though
  if (this.areAllItemsOfArrAInArrB([gdocmtp], tpsreqconv))
  {
    //whatever the type is it requires converstion...
    if (gdocmtp === MimeType.GOOGLE_DOCS)//word document
    {
      return (usemsoft ? (useoldms ? MimeType.MICROSOFT_WORD_LEGACY: MimeType.MICROSOFT_WORD):
        MimeType.OPENDOCUMENT_TEXT);
    }
    else if (gdocmtp === MimeType.GOOGLE_SHEETS)//spread sheet document
    {
      return (usemsoft ? (useoldms ? MimeType.MICROSOFT_EXCEL_LEGACY: MimeType.MICROSOFT_EXCEL):
        MimeType.OPENDOCUMENT_SPREADSHEET);
    }
    else if (gdocmtp === MimeType.GOOGLE_SLIDES)//presentations document
    {
      return (usemsoft ? (useoldms ? MimeType.MICROSOFT_POWERPOINT_LEGACY : MimeType.MICROSOFT_POWERPOINT):
        MimeType.OPENDOCUMENT_PRESENTATION);
    }
    else if (docmtp === MimeType.GOOGLE_VIDEOS) return MimeType.MP4;
    else if (docmtp === MimeType.GOOGLE_APPS_SCRIPT) return MimeType.JSON;
    else if (docmtp === MimeType.GOOGLE_DRAWINGS) return MimeType.GIF;
    else throw new Error("NOT DONE YET 9-11-2025 2:45 AM MST!");
  }
  else return "" + gdocmtp;//return whatever the type is it seems no conversion is required...

  
  //else if (gdocmtp === ?)//? document
  //{
  //  return (usemsoft ? "?" :
  //    "?");
  //}
  //else if (this.areAllItemsOfArrAInArrB([gdocmtp], tpsnoconv)) return "" + gdocmtp;
  //else return "application/pdf";//PDF is likely the only valid option for these
  throw new Error("NOT DONE YET 9-9-2025 12:26 AM MST!");
}
function getMicrosoftMimeTypeForOtherMimeType(gdocmtp, useoldms=false)
{
  return this.getMicrosoftOrOpenMimeTypeForOtherMimeType(gdocmtp, true, useoldms);
}
function getOpenMimeTypeForOtherMimeType(gdocmtp)
{
  return this.getMicrosoftOrOpenMimeTypeForOtherMimeType(gdocmtp, false, false);
}

function isAGoogleMimeType(mptstr)
{
  this.letMustNotBeEmpty(mptstr, "mptstr");
  return (mptstr === MimeType.GOOGLE_APPS_SCRIPT || mptstr === MimeType.GOOGLE_DOCS ||
    mptstr === MimeType.GOOGLE_SHEETS || mptstr === MimeType.GOOGLE_SLIDES ||
    mptstr === MimeType.GOOGLE_DRAWINGS || mptstr === MimeType.GOOGLE_FORMS ||
    mptstr === MimeType.FOLDER || mptstr === MimeType.SHORTCUT ||
    mptstr === MimeType.GOOGLE_VIDS || mptstr === MimeType.GOOGLE_VIDEOS);
}

function getFileExtensionFromMimeType(mptstr)
{
  //Google Search: how to get the proper file extension that corresponds with the mimetype Google Apps Scripts 
  //https://www.google.com/search?q=how+to+get+the+proper+file+extension+that+corresponds+with+the+mimetype+Google+Apps+Scripts&sca_esv=01d7d1da4f3739f4&sxsrf=AE3TifPVKRpSNaNYCnDvKzMOWjW82GRx9Q%3A1757582534557&ei=xpTCaIjeIeGnqtsPgYT3yA0&ved=0ahUKEwiI2YqVsdCPAxXhk2oFHQHCHdkQ4dUDCBA&uact=5&oq=how+to+get+the+proper+file+extension+that+corresponds+with+the+mimetype+Google+Apps+Scripts&gs_lp=Egxnd3Mtd2l6LXNlcnAiW2hvdyB0byBnZXQgdGhlIHByb3BlciBmaWxlIGV4dGVuc2lvbiB0aGF0IGNvcnJlc3BvbmRzIHdpdGggdGhlIG1pbWV0eXBlIEdvb2dsZSBBcHBzIFNjcmlwdHNIAFAAWABwAHgBkAEAmAEAoAEAqgEAuAEDyAEA-AEBmAIAoAIAmAMAkgcAoAcAsgcAuAcAwgcAyAcA&sclient=gws-wiz-serp
  this.letMustNotBeEmpty(mptstr, "mptstr");
  if (mptstr === MimeType.GOOGLE_APPS_SCRIPT) return 'gs';
  else if (mptstr === MimeType.GOOGLE_DOCS || mptstr === MimeType.MICROSOFT_WORD)
  {
    return 'docx'; // Or 'doc' for older formats
  }
  else if (mptstr === MimeType.MICROSOFT_WORD_LEGACY) return 'doc';
  else if (mptstr === MimeType.OPENDOCUMENT_TEXT) return 'odt';
  else if (mptstr === MimeType.GOOGLE_SHEETS || mptstr === MimeType.MICROSOFT_EXCEL)
  {
    return 'xlsx'; // Or 'xls' for older formats
  }
  else if (mptstr === MimeType.MICROSOFT_EXCEL_LEGACY) return 'xls';
  else if (mptstr === MimeType.OPENDOCUMENT_SPREADSHEET) return 'ods';
  else if (mptstr === MimeType.GOOGLE_SLIDES || MimeType.MICROSOFT_POWERPOINT)
  {
    return 'pptx'; // Or 'ppt' for older formats
  }
  else if (mptstr === MimeType.MICROSOFT_POWERPOINT_LEGACY) return 'ppt';
  else if (mptstr === MimeType.OPENDOCUMENT_PRESENTATION) return 'odp';
  else if (mptstr === MimeType.GOOGLE_DRAWINGS) return 'gdraw'; // Or a more common image format if exporting
  else if (mptstr === MimeType.GOOGLE_FORMS) return 'gform';
  else if (mptstr === MimeType.FOLDER) return ''; // Folders don't have file extensions
  else if (mptstr === MimeType.SHORTCUT) return '';//the shortcut extension is unknown or does not have one
  else if (mptstr === MimeType.GOOGLE_VIDS || mptstr === MimeType.GOOGLE_VIDEOS)
  {
    return '';//there are multiple video file formats associated so no extension... however this could be wrong
  }
  else if (mptstr === MimeType.PDF) return 'pdf';
  else if (mptstr === MimeType.JPEG) return 'jpeg';
  else if (mptstr === MimeType.PNG) return 'png';
  else if (mptstr === MimeType.GIF) return 'gif';
  else if (mptstr === MimeType.BMP) return 'bmp';
  else if (mptstr === MimeType.SVG) return 'svg';
  else if (mptstr === MimeType.CSV) return 'csv';
  else if (mptstr === MimeType.MP4) return 'mp4';
  else if (mptstr === 'application/json') return 'json';
  else if (mptstr === 'text/plain') return 'txt';
  else if (mptstr === 'text/html') return 'html';
  else if (mptstr === 'application/zip') return 'zip';
  else throw new Error("the mime type (" + mptstr + ") may have an extension, but it needs to be added here!");
}


//send email message methods here

//this method actually sends the message here
function mySendMessage(mybdystr, mysbj, myemladdr, inceaddr, mdatobj=this.getMyDataInfoObjConsts())
{
  this.letMustBeBoolean(inceaddr, "inceaddr");
  this.letMustNotBeEmpty(mybdystr, "mybdystr");
  this.letMustNotBeEmpty(mysbj, "mysbj");
  this.letMustNotBeEmpty(myemladdr, "myemladdr");
  
  //get the data from the object
  const rkys = ["mnhdri", "emlcoli", "nmcoli", "inccoli", "msgscoli", "sbjcoli", "replyaddrcell", "attachmntscoli",
    "attchmntstpcoli", "bpssatmntswrncell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  const myhdri = mdatobj[rkys[0]];
  const mymsgscoli = mdatobj[rkys[4]];
  const myrepaddrcell = mdatobj[rkys[6]];
  const attchmntscoli = mdatobj[rkys[7]];
  const attchmntstpcoli = mdatobj[rkys[8]];
  const bpsatmntswrncell = mdatobj[rkys[9]];
  
  const mxatchmntsvi = this.getTheMaxValidRowIndex(attchmntscoli, myhdri, mymsgscoli);
  const mxatchmntstpvi = this.getTheMaxValidRowIndex(attchmntstpcoli, myhdri, mymsgscoli);
  const noattchmnts = (mxatchmntstpvi < myhdri + 1);
  console.log("noattchmnts = " + noattchmnts);
  console.log("mybdystr = " + mybdystr);

  const wilatchi = mybdystr.toLowerCase().indexOf("will attach");
  const atchdi = mybdystr.toLowerCase().indexOf("attached");
  const atchmntsi = mybdystr.toLowerCase().indexOf("attachments");
  //console.log("wilatchi = " + wilatchi);
  //console.log("atchdi = " + atchdi);
  //console.log("atchmntsi = " + atchmntsi);

  if (-1 < wilatchi && wilatchi < mybdystr.length || -1 < atchdi && atchdi < mybdystr.length ||
    -1 < atchmntsi && atchmntsi < mybdystr.length)
  {
    console.log("the message indicates that there will be attachments!");
    if (noattchmnts)
    {
      //warn the user...
      const wrnmsga = "The message said there will be attachements, but none were found!";
      console.warn(wrnmsga);
      //alert the user to the problem... and error out... or ignore this and send...
      
      const bypsatchwrning = this.getBoolValFromNumber(ss.getRange(bpsatmntswrncell).getValue());
      if (bypsatchwrning);
      else this.throwAndOrAlertTheError(myalerterrs, wrnmsga + " SEND ABORTED, but can be bypassed!");
    }
    //else;//do nothing
  }
  //else;//do nothing message indicates no attachments so if there are ok i guess.

  const merrmsgc = "either the data is invalid, or the message cannot be sent because a recipiant is not " +
    "included on the send list or the message number is invalid causing no message to be sent!";
  //this.getBoolValFromNumber(mydata[myrw][myinccoli])
  if ((mxatchmntsvi === mxatchmntstpvi) && this.canSendAMessageAndIsValidData(mdatobj) && inceaddr)
  {
    //const mybdystr = this.getMyFinalMessageForRow(myrw, mynmscoli, mymsgrwi, mymsgscoli, mysbjscoli, "MESSAGE");
    const repaddr = ss.getRange(myrepaddrcell).getValue();
    const norepto = this.isValEmptyNullOrUndefined(repaddr);
    //const myemladdr = mydata[myrw][myemlcoli];
    //const mysbj = this.getMyFinalMessageForRow(myrw, mynmscoli, mymsgrwi, mysbjscoli, mysbjscoli, "SUBJECT");
    console.log("norepto = " + norepto);
    console.log("noattchmnts = " + noattchmnts);
    console.log("repaddr = " + repaddr);
    console.log("myemladdr = " + myemladdr);
    console.log("mysbj = " + mysbj);
    console.log("mybdystr = " + mybdystr);
    
    //generate the options object for sending the message
    //
    //we may want a replyTo
    //we may want attachments
    //
    //features we may want to use, but there is currently no way to get these from the sheet and the user are:
    //but these may still be able to be implemented:
    //cc, bcc, htmlBody, inlineImages, name (the name of the sender of the email, I think we want the default)
    //
    //I am a GMAIL user so I cannot use noReply
    
    let myopts = null;
    if (norepto && noattchmnts);
    else
    {
      myopts = {};
      if (norepto);
      else myopts["replyTo"] = "" + repaddr;
      if (noattchmnts);
      else
      {
        //attachments must be an array of blobs
        //we now generate this array from the user provided data
        //get the file array first then get the blobs from said objects...
        //the id or the name
        //if id DriveApp.getFileByID(theid);
        //if name DriveApp.getFilesByName(thename);//there may be multiple
        //so be careful you only want one...
        //once you have them all, then you can use them to handle this...
        let myfilearr = [];
        for (let r = myhdri + 1; r < mxatchmntsvi + 1 && r < mxrow; r++)
        {
          let myfilenmoridstr = mydata[r][attchmntscoli];
          let myfiletpstr = mydata[r][attchmntstpcoli];
          let myfiletpnum = Number(myfiletpstr);
          let fileobj = null;
          if (myfiletpnum === 1) fileobj = DriveApp.getFileById(myfilenmoridstr);//this is the id
          else if (myfiletpnum === 0)
          {
            //this is the file name
            let fileobjs = DriveApp.getFilesByName(myfilenmoridstr);
            let myfileobjsarr = [];
            while (fileobjs.hasNext()) myfileobjsarr.push(fileobjs.next());
            this.letMustNotBeEmpty(myfileobjsarr, "myfileobjsarr");
            if (myfileobjsarr.length === 1) fileobj = myfileobjsarr[0]; 
            else
            {
              //console.log("myfileobjsarr = ", myfileobjsarr);
              this.printFileObjectsArray(myfileobjsarr);
              throw new Error("invalid file name was used here the name must result in one and only one " +
                "file, but there are multiple matches!");
            }
          }
          else if (myfiletpnum === 2)
          {
            //file url is given
            //what we really need is the name or the ID
            //we can extract the ID from the URL
            //or if a method exists to open a file by the URL, then we can get the file object.
            //the second option does not work because drive app is lacking that method.
            //console.log("attempting to get the file by URL!");

            //let mfurl = ?;//myfilenmoridstr
            let ei = myfilenmoridstr.indexOf("/edit");
            let si = -1;
            for (let i = ei - 1; i < myfilenmoridstr.length && -1 < i; i--)
            {
              if (myfilenmoridstr.charAt(i) === '/')
              {
                si = i + 1;
                break;
              }
            }
            //console.log("si = " + si);
            //console.log("ei = " + ei);

            if (si < 0 || si === ei || ei < si) throw new Error("illegal value found and used for index si!");
            let mfinidstr = myfilenmoridstr.substring(si, ei);
            //console.log("si is valid!");
            //console.log("mfinidstr = " + mfinidstr);

            fileobj = DriveApp.getFileById(mfinidstr);
          }
          else throw new Error("invalid option found and used for the file type num!");
          myfilearr.push(fileobj);
        }//end of r for loop
        this.printFileObjectsArray(myfilearr);
        
        
        //this uses the getAs method is really getBlobAs method...
        //what we want to do is export the file to something that the user can use
        //if the file is a Google Mime Type then we need to get the type that the user wants-ish...
        //if the file is not a Google Mime Type we should be able to attach it as is
        
        //GOOGLE SEARCH: I am attempting to convert google files or just use non google files as attachments with the MailApp
        //https://www.google.com/search?q=I+am+attempting+to+convert+google+files+or+just+use+non+google+files+as+attachments+with+the+MailApp&oq=I+am+attempting+to+convert+google+files+or+just+use+non+google+files+as+attachments+with+the+MailApp&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRiPAjIHCAIQIRiPAtIBCTM0NjIzajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
        
        //https://stackoverflow.com/questions/78549004/drive-files-export-not-working-in-apps-script
        //https://stackoverflow.com/questions/15636543/convert-google-doc-to-docx-using-google-script
        myopts["attachments"] = myfilearr.map((mfile) => {
          let mptstr = this.getMicrosoftMimeTypeForOtherMimeType(mfile.getMimeType(), false);
          let isgmtp = this.isAGoogleMimeType(mfile.getMimeType());
          let fnfmt = this.getFileExtensionFromMimeType(mptstr);
          let nwfnm = mfile.getName() + "." + fnfmt;
          console.log("mfile.getName() = " + mfile.getName());
          console.log("mfile.getMimeType() = " + mfile.getMimeType());
          console.log("mfile.getUrl() = " + mfile.getUrl());
          console.log("isgmtp = " + isgmtp);
          console.log("mptstr = " + mptstr);
          console.log("fnfmt = " + fnfmt);
          console.log("nwfnm = " + nwfnm);

          let mcnvfile = null;
          if (isgmtp)
          {
            //if the new file name already exists, then we do not need to convert
            //but it must be located in the exact same folder as the original file.
            //list the files in the same folder as the file
            //see if one of the file names match the new file name
            //if it does, no need to convert.
            //set exists as true and then assign the file...
            let nwfaexists = false;
            let nwfile = null;
            const fldrs = mfile.getParents();
            let myfilefldrsarr = [];
            while(fldrs.hasNext()) myfilefldrsarr.push(fldrs.next());
            let breakouter = false;
            for (let n = 0; n < myfilefldrsarr.length; n++)
            {
              let mfldr = myfilefldrsarr[n];
              let mfilesitr = mfldr.getFiles();
              let mfilesarr = [];
              console.log("folder name: \"" + mfldr.getName() + "\" has the following files:");
              
              while(mfilesitr.hasNext()) mfilesarr.push(mfilesitr.next());
              for (let k = 0; k < mfilesarr.length; k++)
              {
                console.log("file name in the folder: " + mfilesarr[k].getName());
                if (mfilesarr[k].getName() === nwfnm)
                {
                  nwfaexists = true;
                  nwfile = mfilesarr[k];
                  breakouter = true;
                  break;
                }
              }//end of k for loop
              if (breakouter) break;
            }//end of n for loop
            console.log("nwfaexists = " + nwfaexists);
            console.log("nwfilename = nwfile.getName() = " + nwfile.getName());
            //throw new Error("NOT DONE YET 9-18-2025 1:08 AM MST!");

            if (nwfaexists)
            {
              //return that file instead
              this.letMustBeDefined(nwfile, "nwfile");
              mcnvfile = nwfile.getBlob();
              console.log("created the blob successfully!");
              //throw new Error("NOT DONE YET 9-18-2025 12:55 AM MST!");
            }
            else
            {
              //need to convert the file
              let baseurl = "https://docs.google.com/feeds/download/documents/export/Export?id=";
              let myurl = baseurl + mfile.getId() + "&exportFormat=" + fnfmt;
              console.log("myurl = " + myurl);

              let token = ScriptApp.getOAuthToken();
              this.letMustNotBeEmpty(token, "token");
              let blb = UrlFetchApp.fetch(myurl, 
                                {
                                  muteHttpExceptions: true,
                                  headers : {
                                    Authorization : 'Bearer '+token
                                  }
                                }).getBlob();
              console.log("created the blob successfully!");

              //Create file in Google Drive
              mcnvfile = DriveApp.createFile(blb).setName(nwfnm);
              //mcnvfile = Drive.Files.export(mfile.getId(), mptstr, {alt: 'media'});
              //mcnvfile = mfile.getAs(mptstr);
              //mcnvfile.setName(nwfnm);
              console.log("created the file successfully!");
            }
          }
          else
          {
            //do not need to convert the file can be attached directly
            mcnvfile = mfile.getBlob();
            console.log("created the blob successfully!");
          }

          //let mcnvfile = Drive.Files.export(mfile.getId(), mptstr, {alt: 'media'});
          //mcnvfile.setName(mfile.getName() + "." + this.getFileExtensionFromMimeType(mptstr));
          //type that corresponds to the file mime type.
          //mfile.getAs(mfile.getMimeType())
          //return null;
          return mcnvfile;
        });//problem maybe
        
        //console.log("myopts = ", myopts);
        //this.printMyOptionsObject(myopts);
        //throw new Error("NOT DONE YET 9-4-2025 3:30 AM MST!");
      }
    }
    //console.log("myopts = ", myopts);
    this.printMyOptionsObject(myopts);

    const sndmsg = true;//this must be true in order to actually send the message.
    if (sndmsg)
    {
      try
      {
        //stuff needs to change here to handle the attachments if present 9-4-2025 2:50 AM MST
        //MailApp.sendEmail(recipiant, subject, body, options);//options has cc, bcc, attachments, replyTo, ...
        if (noattchmnts)
        {
          if (norepto) MailApp.sendEmail(myemladdr, mysbj, mybdystr);
          else MailApp.sendEmail(myemladdr, repaddr, mysbj, mybdystr);
        }
        else MailApp.sendEmail(myemladdr, mysbj, mybdystr, myopts);
      }
      catch(ex)
      {
        console.error(ex);
        console.error(ex.stack);
        this.throwAndOrAlertTheError(myalerterrs, ex);
      }
    }
    //else;//do nothing
    console.warn("sndmsg (did the message actually get sent) = " + sndmsg);

    const smsg = "successfully sent the message to the person with the address(es) (" + myemladdr + ")!";  
    console.log(smsg);
    return true;
  }
  else this.throwAndOrAlertTheError(myalerterrs, merrmsgc);
}

//myrw is the recipiant row index and the mymsgrwi is the message row index
//due to how the spreadsheet is setup these could be the same
function mySendAMessageViaRows(myrw, mymsgrwi, mdatobj=this.getMyDataInfoObjConsts())
{
  //get the data from the object
  const rkys = ["emlcoli", "nmcoli", "inccoli", "msgscoli", "sbjcoli", "replyaddrcell"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  
  const myemlcoli = mdatobj[rkys[0]];
  const mynmscoli = mdatobj[rkys[1]];
  const myinccoli = mdatobj[rkys[2]];
  const mymsgscoli = mdatobj[rkys[3]];
  const mysbjscoli = mdatobj[rkys[4]];
  //const myrepaddrcell = mdatobj[rkys[5]];

  const merrmsga = "my includes col index must be at least zero and less than the max col, but it was not!";
  const merrmsgb = "the row indexes myrw and mymsgrwi must both be at least zero and less than the max row, " +
    "but at least one of them was not!";
  if (myinccoli < 0 || mxcol - 1 < myinccoli)
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }
  if (myrw < 0 || mymsgrwi < 0 || mxrow - 1 < myrw || mxrow - 1 < mymsgrwi)
  {
    //throw new Error(merrmsgb);
    this.throwAndOrAlertTheError(myalerterrs, merrmsgb);
  }
  console.log("mySendAMessageViaRows: 1. calling getMyFinalMessageForRow()!");
  const mybdystr = this.getMyFinalMessageForRow(myrw, mynmscoli, mymsgrwi, mymsgscoli, mysbjscoli, "MESSAGE");
  
  console.log("mySendAMessageViaRows: 2. calling getMyFinalMessageForRow()!");
  const mysbj = this.getMyFinalMessageForRow(myrw, mynmscoli, mymsgrwi, mysbjscoli, mysbjscoli, "SUBJECT");
  const myemladdr = mydata[myrw][myemlcoli];
  const inceaddr = this.getBoolValFromNumber(mydata[myrw][myinccoli]);
  return this.mySendMessage(mybdystr, mysbj, myemladdr, inceaddr, mdatobj);
}
function mySendAMessageViaRowsMain(myrw, mymsgrwi)
{
  return this.mySendAMessageViaRows(myrw, mymsgrwi, this.getMyDataInfoObjConsts());
}

function sendTheMessageFromTheSheetForARowViaRows(myrw, mdatobj=this.getMyDataInfoObjConsts())
{
  //the message row index that is needed for the above will come from the spreadsheet
  const msgrwdatobj = this.getMyMessageRowDataObjectFromInfoDatObj(mdatobj);
  const rkys = ["msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, rkys, "msgrwdatobj");
  return this.mySendAMessageViaRows(myrw, msgrwdatobj[rkys[0]], mdatobj);
}
function sendTheMessageFromTheSheetForARowViaRowsMain(myrw)
{
  return this.sendTheMessageFromTheSheetForARowViaRows(myrw, this.getMyDataInfoObjConsts());
}

function sendTheMessageFromTheSheetForAllRows(mdatobj=this.getMyDataInfoObjConsts())
{
  const rkys = ["emlcoli", "mnhdri", "inccoli", "nmcoli", "onetoonecell", "msgscoli", "sbjcoli"];
  this.letObjMustHaveTheseKeys(mdatobj, rkys, "mdatobj");
  
  const mxemadrsvi = this.getTheMaxValidRowIndexMain(mdatobj[rkys[0]]);
  const myhdrwi = mdatobj[rkys[1]];
  console.log("start row = mdatobj[" + rkys[1] + "] + 1 = myhdrwi + 1 = " + (myhdrwi + 1));
  console.log("mxemadrsvi = " + mxemadrsvi);
  console.log("mxrow = " + mxrow);

  const merrmsga = "the header row index must be at least 0 and less than the max row, but it was not!";
  if (myhdrwi < 0 || mxrow - 1 < myhdrwi)
  {
    //throw new Error(merrmsga);
    this.throwAndOrAlertTheError(myalerterrs, merrmsga);
  }

  let csndtocnt = 0;
  let mycansndobjs = [];
  for (let r = myhdrwi + 1; r < mxrow && r < mxemadrsvi + 1; r++)
  {
    const cansendtothis = this.getBoolValFromNumber(mydata[r][mdatobj[rkys[2]]]);
    if (cansendtothis) csndtocnt++;
    mycansndobjs.push({"cansendtothis": cansendtothis, "r": r, "incnumstr": mydata[r][mdatobj[rkys[2]]]});
  }
  console.log("csndtocnt = " + csndtocnt);

  const rmdamnt = MailApp.getRemainingDailyQuota();
  console.log("rmdamnt = " + rmdamnt);

  const qlimiterr = "the number of messages that we need to send will put us over the quota limit of " + rmdamnt +
    " per day.";
  if (csndtocnt < rmdamnt);
  else this.throwAndOrAlertTheError(myalerterrs, qlimiterr);

  //get the rows that we can send to
  //get the names and email address for those rows
  //now figure out if we are to send one to all or all to all
  //then actually do that...
  const csndobjs = mycansndobjs.filter((mobj) => mobj["cansendtothis"]);
  const csndris = csndobjs.map((mobj) => Number(mobj["r"]));
  const finobjs = csndris.map((rval) => ({"r": rval, "emailaddr": mydata[rval][mdatobj[rkys[0]]],
    "nameval": mydata[rval][mdatobj[rkys[3]]]}));
  const nofinobjs = this.isValEmptyNullOrUndefined(finobjs);
  const allnms = (nofinobjs ? [] : finobjs.map((mobj) => mobj["nameval"]));
  const allemls = (nofinobjs ? [] : finobjs.map((mobj) => mobj["emailaddr"]));
  const allemlsonstr = (nofinobjs ? "" : allemls.join(", "));
  const allnmsonstr = (nofinobjs ? "" : ((allnms.length === 1) ? allnms[0] :
    allnms.filter((nm, nmi) => (nmi + 1 < allnms.length)).join(", ") + ", and " + allnms[allnms.length - 1]));
  console.log("finobjs = ", finobjs);
  console.log("allnms = ", allnms);
  console.log("allemls = ", allemls);
  console.log("allnmsonstr = " + allnmsonstr);
  console.log("allemlsonstr = " + allemlsonstr);

  //if there is only one object then it does not matter if we are sending out one email to all or all to all...
  //more than one and it does matter.

  //if the message or subject needs the name variable and we are only sending out one email to all,
  //how does this get handled? We should list all of the names and join them together...
  //if we are doing all to all, it will be handled correctly...

  const onetoonecell = mdatobj[rkys[4]];
  this.letMustBeValidAOneNotation(onetoonecell, onetoonecell);
  const useonetoone = this.getBoolValFromNumber(ss.getRange(onetoonecell).getValue());
  const finuseonetoone = (nofinobjs ? false : (finobjs.length === 1 || useonetoone));
  console.log("useonetoone = " + useonetoone);
  console.log("finuseonetoone = " + finuseonetoone);

  //the original message or subject is what we need mydata[row][col]
  const msgrwdatobj = this.getMyMessageRowDataObjectFromInfoDatObj(mdatobj);
  const orkys = ["msgrwi", "messagerowisnotvalid"];
  this.letObjMustHaveTheseKeys(msgrwdatobj, orkys, "msgrwdatobj");

  const msgrwi = msgrwdatobj[orkys[0]];
  const msgrwisnotvld = msgrwdatobj[orkys[1]];
  const origmsg = (msgrwisnotvld ? null : mydata[msgrwi][mdatobj[rkys[5]]]);
  const origsbj = (msgrwisnotvld ? null : mydata[msgrwi][mdatobj[rkys[6]]]);
  console.log("msgrwdatobj = ", msgrwdatobj);
  console.warn("msgrwi = " + msgrwi);
  console.log("msgrwisnotvld = " + msgrwisnotvld);
  console.log("origmsg = " + origmsg);
  console.log("origsbj = " + origsbj);

  if (msgrwisnotvld)
  {
    //handle the error...
    const merrmsgc = "illegal message row index found and used! The message number was illegal! Either that " +
      "or no message can be sent!";
    //throw new Error(merrmsgc);
    this.throwAndOrAlertTheError(myalerterrs, merrmsgc);
  }
  //else;//do nothing safe to proceed
  
  let scnt = 0;
  let fcnt = 0;
  let faddrs = [];
  if (nofinobjs);
  else
  {
    if (finuseonetoone)
    {
      //one email out to one person...
      for (let r = myhdrwi + 1; r < mxrow && r < mxemadrsvi + 1; r++)
      {
        let cansendtothis = this.getBoolValFromNumber(mydata[r][mdatobj[rkys[2]]]);
        console.log("r = " + r);
        console.log("can send to this: " + cansendtothis);
        
        if (cansendtothis)
        {
          try
          {
            let res = this.sendTheMessageFromTheSheetForARowViaRows(r, this.getMyDataInfoObjConsts());
            scnt++;
          }
          catch(ex)
          {
            console.error(ex);
            console.error(ex.stack);
            fcnt++;
            faddrs.push(mydata[r][mdatobj[rkys[0]]]);
          }
        }
        else console.log("skipping r = " + r + "!");
      }//end of r for loop
    }
    else
    {
      //one email only this goes to everyone, but only one email...
      //just combine them and pass them in if it is used fine if not fine too...
      console.log("allnmsonstr = " + allnmsonstr);
      console.log("allemlsonstr = " + allemlsonstr);

      //const mymsg = this.getFinalMessageContent(origmsg, allnmsonstr, origmsgtp, mysbjscoli, mymsgrwis=[-1]);
      const mymsg = this.getMyFinalMessageFromNamesFromDatObjMain(allnmsonstr);
      const mysbj = this.getMyFinalSubjectFromNamesFromDatObjMain(allnmsonstr);
      console.log("mymsg = " + mymsg);
      console.log("mysbj = " + mysbj);

      try
      {
        let res = this.mySendMessage(mymsg, mysbj, allemlsonstr, true, mdatobj);
        scnt++;
      }
      catch(ex)
      {
        console.error(ex);
        console.error(ex.stack);
        fcnt++;
        faddrs.push(allemlsonstr);
      }
    }
  }

  const myalrtmsg = ((fcnt < 1) ? "successfully sent all of the messages!" :
    "successfully sent some (" + scnt +") but some (" + fcnt + ") failed! The failed addresses are: " +
    faddrs.join(", ") + "!");
  console.log(myalrtmsg);
  this.alertResultsToUser(myalrtmsg);
  return true;
}
function sendTheMessageFromTheSheetForAllRowsMain()
{
  return this.sendTheMessageFromTheSheetForAllRows(this.getMyDataInfoObjConsts());
}

function includeAndOnlySendToTheGroupNumbers(mdatobj=this.getMyDataInfoObjConsts())
{
  if (this.includeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(true, mdatobj));
  return this.sendTheMessageFromTheSheetForAllRows(mdatobj);
}
function includeAndOnlySendToTheGroupNumbersMain()
{
  return this.includeAndOnlySendToTheGroupNumbers(this.getMyDataInfoObjConsts());
}
function includeAndAddGroupNumbersAndSendIt(mdatobj=this.getMyDataInfoObjConsts())
{
  if (this.includeCertainGroupNumbersOnlyOrNotOnIncColFromDatObjAndSheet(false, mdatobj));
  return this.sendTheMessageFromTheSheetForAllRows(mdatobj);
}
function includeAndAddGroupNumbersAndSendItMain()
{
  return this.includeAndAddGroupNumbersAndSendIt(this.getMyDataInfoObjConsts());
}


//NOTE: any changes to these variables here (values or key names in the return object) will populate
//throughout the ENTIRE program. It is recommended that you run the test function after making changes.
//If you make changes to these variables they are assumed to be the same as on the spreadsheet
//If not the program may skip stuff or crash or do something unexpected
function getMyDataInfoObjConsts()
{
  //the indexes start at 0. Some spreadsheet methods make them start at 1 and others start at 0.
  const mnhdri = 6;//the header row index = row number displayed on the sheet - 1
  const emlcoli = 0;//email address col index
  const nmcoli = 1;//names col index
  const inccoli = 2;//include col index
  const grpnumscoli = 3;//groupnums col index
  const attchmntscoli = 4;//attachments col index
  const attcmntstpcoli = 5;//attachments type col index
  const msgscoli = 6;//message col index
  const sbjcoli = 7;//message_subject col index
  const onetoonecell = "B1";//the cell where the use one_email_to_one_person resides
  const msgsntnmbrcell = "B2";//the cell where the message_number_to_be_sent resides
  const repaddrcell = "B3";//the cell where the reply_to_email_address resides.
  const incgrpnumscell = "B4";//the cell where the include group numbers resides.
  const bpssatmntswrncell = "B5";//the cell where the bypass attachments warning value resides.
  return {"mnhdri": mnhdri, "onetoonecell": onetoonecell, "msgsntnmbrcell": msgsntnmbrcell,
    "replyaddrcell": repaddrcell, "incgrpnumscell": incgrpnumscell, "bpssatmntswrncell": bpssatmntswrncell,
    "emlcoli": emlcoli, "nmcoli": nmcoli, "inccoli": inccoli, "grpnumscoli": grpnumscoli,
    "attachmntscoli": attchmntscoli, "attchmntstpcoli": attcmntstpcoli, "msgscoli": msgscoli, "sbjcoli": sbjcoli};
}
function getMyDataInfoObjConstsForUser() { this.alertResultsToUser(this.getMyDataInfoObjConsts()); }


function myTestFunction()
{
  const mdatobj = this.getMyDataInfoObjConsts();
  const {mnhdri, onetoonecell, msgsntnmbrcell, replyaddrcell, incgrpnumscell, emlcoli, nmcoli, inccoli,
    grpnumscoli, attachmntscoli, attchmntstpcoli, msgscoli, sbjcoli} = mdatobj;
  const colkys = Object.keys(mdatobj).filter((mky) => (
    !(mky.indexOf("coli") < 0 || mky.length - 1 < mky.indexOf("coli"))));
  console.log("colkys = ", colkys);
  console.log("mnhdri = " + mnhdri);
  console.log("emlcoli = " + emlcoli);
  console.log("nmcoli = " + nmcoli);
  console.log("inccoli = " + inccoli);
  console.log("grpnumscoli = " + grpnumscoli);
  console.log("attachmntscoli = " + attachmntscoli);
  console.log("attchmntstpcoli = " + attchmntstpcoli);
  console.log("msgscoli = " + msgscoli);
  console.log("sbjcoli = " + sbjcoli);
  console.log("onetoonecell = " + onetoonecell);
  console.log("msgsntnmbrcell = " + msgsntnmbrcell);
  console.log("replyaddrcell = " + replyaddrcell);
  console.log("incgrpnumscell = " + incgrpnumscell);
  //throw new Error("NOT DONE YET 9-4-2025 2:50 AM MST!");

  //console.log(this.getEmailAddressVarNames());
  //console.log(this.getReplyToEmailAddressVarNames());//do not call directly very expensive
  //console.log(Session.getActiveUser().getEmail());//sender email address
  //console.log(this.getMessageNumberVarNames());
  //console.log(this.isVarNameOnMessagesOrSubjectNames("MESSAGE_NUMBER_6", true));

  const runsetsomeonlytst = false;
  const runresettst = (runsetsomeonlytst ? true : false);
  if (runresettst)
  {
    const stopaftrtst = (runsetsomeonlytst ? false: true);
    console.log("BEGIN TESTS FOR RESETING THE INCLUDE COL HERE:");
    
    this.resetMyCol(inccoli, mnhdri);
    //this.resetIncludeColMain();
    if (stopaftrtst) throw new Error("DONE WITH RESET TEST NEED TO CHECK THE SHEET NOW!");
  }
  //else;//do nothing

  if (runsetsomeonlytst)
  {
    const stopaftrtst = true;
    //console.log(this.includeOrExcludeCertainGroupNumbers("1, 15", inccoli, grpnumscoli, mnhdri, true));
    let gpstrdobj = this.getGroupNumbersStringFromDatObj(mdatobj);
    console.log(this.includeOrExcludeCertainGroupNumbers(gpstrdobj, inccoli, grpnumscoli, mnhdri, true));
    //console.log(this.includeCertainGroupNumbersOnIncColFromDatObjAndSheet(mdatobj));
    //console.log(this.excludeCertainGroupNumbersOnIncColFromDatObjAndSheet(mdatobj));
    if (stopaftrtst) throw new Error("DONE WITH INCLUDE ONLY TEST NEED TO CHECK THE SHEET NOW!");
  }
  //else;//do nothing

  console.log("BEGIN LEADING ZEROS TESTS HERE:");
  console.log(this.addLeadingZeros(0, 2));//00
  console.log(this.addLeadingZeros(0, 3));//000
  console.log(this.addLeadingZeros(-1, 2));//-01
  console.log("BEGIN MAX VALID ROW INDEX FOR COL INDEX TESTS HERE:");
  colkys.forEach((mky) => {
    console.log("RUNING TESTS FOR mky = " + mky + " NOW:");
    console.log(this.getTheMaxValidRowIndex(mdatobj[mky], mnhdri, msgscoli));
    console.log(this.getTheMaxValidRowIndexMain(mdatobj[mky]));
  });
  console.log(this.getGroupNumbersStringFromDatObj(mdatobj));
  console.log("BEGIN GET ALL INDEXS OF AND MY SPLIT TESTS HERE:");
  console.log(this.getAllIndexesOf("so", "dear so and so something happened...", 0));
  console.log("this is a string!".split(""));//normal split one character per string on the array
  console.log("this is a string!".split(" "));//normal split ["this", "is", "a", "string!"];
  console.log(this.mySplitWithDelim(null, null));//[""]
  console.log(this.mySplitWithDelim("this is a string!", null));//one character per string on the array
  console.log(this.mySplitWithDelim("this is a string!", " "));//["this","is","a","string!"];//like normal split
  console.log(this.mySplitWithLen(null, null, 0));//[""]
  console.log(this.mySplitWithLen("this is a string!", [4, 7, 9], 1));
  //                               01234567890123456
  //["this", "is", "a", "string!"];//like normal split
  console.log(this.mySplitWithLen("this is a string!", [4, 7, 9], 0));
  //["this", " is", " a", " string!"];//not normal split
  //it just splits it at the indexes only it does not remove the delimeter like the normal split does
  console.log(this.mySplit("this is a string!", [4, 7, 9], [1, 1, 1]));//same as normal above
  console.log(this.mySplit("this is a string!", [4, 7, 9], [0, 0, 0]));//same as not normal above
  console.log(this.mySplit("this is a string!", [4, 7, 9], [1, 2, 1], false));
  console.log(this.mySplit("this is a string!", [4, 7, 9], [1, 2, 1], true));//abnormal split
  //                            ^  ^^^
  //                        01234567890123456
  //["this", "is", "", "string!"] or ["this", "is", "string!"];
  
  console.log("BEGIN TESTS FOR GETTING THE VAR NAMES HERE:");
  console.log(this.getPossibleVariableNamesAndLocations("Dear <Name>, this is a test! The date " +
    "<NEXT_SUNDAY_MORNING> the time <TIME> are here!"));
  console.log(this.getPossibleVariableNamesAndLocations("Dear <Name>, this is a test! The date " +
    "<skip><NEXT_SUNDAY></skip> the time <skip><TIME></skip> are here! My other time is <TIME>!"));
  console.log(this.getPossibleVariableNamesAndLocations("Dear <Name>, this is a test! The items " +
    "<DREKSEL_ITEMS> the time <skip><TIME></skip> are here! My other time is <TIME>!"));

  console.log("BEGIN TESTS FOR GENERATING THE FINAL MESSAGE HERE:");
  //try
  //{
  //  console.log(this.getFinalMessageContent(null, "SOMEONE", "OTHER", sbjcoli, [-1]));//errors out no message
  //}
  //catch(ex)
  //{
  //  console.log("inside of the first error handler!");
  //  console.error(ex.stack);
  //  this.throwAndOrAlertTheError(myalerterrs, ex);
  //}
  //console.log(this.getFinalMessageContent(null, "SOMEONE", "OTHER", sbjcoli, [-1]));//errors out no message
  //console.log(this.getFinalMessageContent("Dear <Name>, this is a test!", null, "OTHER", sbjcoli, [-1]));
  //errors out the name must not be empty
  //console.log(this.getFinalMessageContent("Dear <Name>, this is a test!", "SOMEONE", null, sbjcoli, ["a"]));
  //errors out invalid message row index
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test!", "SOMEONE", null, sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear no-one, this is a test!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <DATE> the time <TIME> are here!",
    "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <NEXT_SUNDAY> the time " +
    "<TIME> are here!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <NEXT_SUNDAY_NO_DAY> " +
    "the time <TIME> are here!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <NEXT_SUNDAY_MORNING> " +
    "the time <TIME> are here!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  
  //can the message and subjects be included in the test messages
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <NEXT_SUNDAY_MORNING> " +
    "the time <TIME> are here! <MESSAGE_NUMBER_4>", "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <NEXT_SUNDAY_MORNING> " +
    "the time <TIME> are here! <SUBJECT_NUMBER_4>", "SOMEONE", "OTHER", sbjcoli, [-1]));
  //throw new Error("NOT DONE YET WITH THE METHOD!");

  
  //the ignore test
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <skip><NEXT_SUNDAY></skip> " +
    "the time <skip><TIME></skip> are here!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  console.log(this.getFinalMessageContent("Dear <Name>, this is a test! The date <skip><NEXT_SUNDAY></skip> " +
    "the time <skip><TIME></skip> are here! My other time is <TIME>!", "SOMEONE", "OTHER", sbjcoli, [-1]));
  //Dear SOMEONE, this is a test! The date <NEXT_SUNDAY> the time 3:55.00 AM are here!
  
  //the idea with the above test is that it handles everything else like normal except it skips the part inside
  //of the skip, but handles them at the very end where it just removes the skip tags,
  //but returns the final instead of resubstituting the value in.
  //but we also want to make sure this does not get stuck in an infinite loop
  //we also want to make sure it will replace others too.
  //we could split it at the skip blocks and then just merge at the end and then handle them...
  //throw new Error("NOT DONE YET WITH THE METHOD!");
  
  console.log("BEGIN TESTS FOR GETTING THE MESSAGE ROW DATA OBJECT:");
  console.log(this.getMyMessageRowDataObjectFromCell(mnhdri, msgscoli, msgsntnmbrcell));
  console.log(this.getMyMessageRowDataObjectMain());
  console.log("BEGIN TESTS FOR GETTING THE FINAL MESSAGE FROM THE SHEET:");
  console.log(this.getMyFinalMessageForRow(mnhdri + 1, nmcoli, mnhdri + 1, msgscoli, sbjcoli, "MESSAGE"));
  console.log(this.getFinalMessageForRowMain(mnhdri + 1, mnhdri + 1));
  console.log(this.getMyFinalMessageForRowFromSheet(mnhdri + 1, nmcoli, mnhdri, msgscoli, msgsntnmbrcell,
    sbjcoli));
  console.log(this.getMyFinalMessageForRowFromSheetMain(mnhdri + 1));
  const allnmstr = "moony, wormtail, padfoot, prongs";
  //console.log(this.getMyFinalMessageFromNamesFromDatObjMain(allnmstr));//errors out if no message
  //console.log(this.getMyFinalSubjectFromNamesFromDatObjMain(allnmstr));//errors out if no message
  //console.log(this.getMyFinalMessageFromSheetWithTestNameMain());//errors out if no message
  //console.log(this.getMyFinalSubjectFromSheetWithTestNameMain());//errors out if no message
  console.log("BEGIN MESSAGE SENDING TESTS HERE:");
  console.log("TSTFNCN: isvlddata = " + this.isValidDataMain());
  console.log("TSTFNCN: cansendmsg = " + this.canSendAMessage(mnhdri, inccoli, msgscoli, msgsntnmbrcell));
  console.log("TSTFNCN: cansendmsgmain = " + this.canSendAMessageMain());
  console.log("TSTFNCN: cansendmsgandisvlddata = " + this.canSendAMessageAndIsValidDataMain());
  //console.log(mydata[31][msgscoli]);
}
