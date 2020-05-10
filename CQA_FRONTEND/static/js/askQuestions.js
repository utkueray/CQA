let qText = "";
let qTitle = "";
let tags = "";

var simplemde = new SimpleMDE({

    autofocus: true,
    blockStyles: {
        bold: "__",
        italic: "_"
    },
    element: document.getElementById("editor"),
    forceSync: true,
    hideIcons: ["guide", "heading"],
    indentWithTabs: false,
    insertTexts: {
        horizontalRule: ["", "\n\n-----\n\n"],
        image: ["![](http://", ")"],
        link: ["[", "](http://)"],
        table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
    },
    lineWrapping: true,
    parsingConfig: {
        allowAtxHeaderWithoutSpace: true,
        strikethrough: false,
        underscoresBreakWords: true,
    },
    placeholder: "Type here...",
    previewRender: function (plainText, preview) {
        setTimeout(function () {
            preview.innerHTML = plainText; // markdown parser
        }, 250);

        return "Loading...";
    },
    promptURLs: true,
    renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
    },
    shortcuts: {
        drawTable: "Cmd-Alt-T"
    },

    spellChecker: false,
    styleSelectedText: false,
    toolbarTips: true,
    toolbar: [
        'bold', 'italic', 'heading', 'quote', 'unordered-list', 'ordered-list',
        'link', 'image', 'table', 'code', 'fullscreen', 'preview', 'guide'
    ],
});

$('#tagger').tagit({
    availableTags: sampleTags,
    allowDuplicates: false,
    placeholderText: "Tags",   // Sets `placeholder` attr on input field.


});

function writeDB() {


    qTitle = document.getElementById('qTitle').value
    qText = simplemde.value();

    tags = $("#tagger").tagit("assignedTags").join(' ')

    if (qTitle !== "" && qText !== "" && tags !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/" + qText.split(' ').join('_').replace(/[?=]/g, "") + "/" + tags.split(' ').join('_') + "/"
    } else if (qTitle !== "" && qText !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/" + qText.split(' ').join('_').replace(/[?=]/g, "") + "/"
    } else if (qTitle !== "") {
        window.location = "/results/" + userData.derived_userReputation + "/" + userData.derived_userViews + "/" + userData.derived_userUpVotes + "/" + userData.derived_userDownVotes + "/" + userData.derived_userCreationDate + "/" + userData.derived_userLastAccessDate + "/" + qTitle.split(' ').join('_').replace(/[?=]/g, "") + "/"
    }
}