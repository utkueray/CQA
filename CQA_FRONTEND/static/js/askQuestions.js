let qText = "";
let qTitle = "";
let tags = "";
(function () {

    var converter2 = new Markdown.Converter();

    converter2.hooks.chain("preConversion", function (text) {
        qText = text;

        return text.replace(/\b(a\w*)/gi, "*$1*");
    });

    converter2.hooks.chain("plainLinkText", function (url) {
        return "This is a link to " + url.replace(/^https?:\/\//, "");
    });

    var help = function () { alert("Do you need help?"); };

    var editor2 = new Markdown.Editor(converter2, "-second", { handler: help });

    editor2.run();
})();

function writeDB() {


    qTitle = document.getElementById('qTitle').value
    tags = "<machine-learning><terminology><comparison>"

    if (qTitle !== "" && qText !== "" && tags !== ""){
        window.location = "/results/"+userData.derived_userReputation+"/"+userData.derived_userViews+"/"+userData.derived_userUpVotes+"/"+userData.derived_userDownVotes+"/"+userData.derived_userCreationDate +"/"+userData.derived_userLastAccessDate+"/"+qTitle.split(' ').join('_').replace(/[?=]/g, "")+"/"+qText.split(' ').join('_').replace(/[?=]/g, "")+"/"+tags.split(' ').join('_')+"/"
    } else if (qTitle !== "" && qText !== ""){
        window.location = "/results/"+userData.derived_userReputation+"/"+userData.derived_userViews+"/"+userData.derived_userUpVotes+"/"+userData.derived_userDownVotes+"/"+userData.derived_userCreationDate +"/"+userData.derived_userLastAccessDate+"/"+qTitle.split(' ').join('_').replace(/[?=]/g, "")+"/"+qText.split(' ').join('_').replace(/[?=]/g, "")+"/"
    } else if (qTitle !== ""){
        window.location = "/results/"+userData.derived_userReputation+"/"+userData.derived_userViews+"/"+userData.derived_userUpVotes+"/"+userData.derived_userDownVotes+"/"+userData.derived_userCreationDate +"/"+userData.derived_userLastAccessDate+"/"+qTitle.split(' ').join('_').replace(/[?=]/g, "")+"/"
    }
}

