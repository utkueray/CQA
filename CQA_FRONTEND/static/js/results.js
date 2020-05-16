let idDict = resultDict;

let sortedIDArr = [];

let scoreArr = [];

function swap(json) {
    var ret = {};
    for (var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

async function getData() {

    if (idDict != null) {
        let queryS = "https://api.stackexchange.com/2.2/questions/";
        let queryE = "?order=desc&sort=activity&site=ai&key=" + APIKEY;
        for (let key in idDict) {
            queryS = queryS + key + ';';
        }


        // generate a query string
        queryS = queryS.slice(0, -1) + queryE;
        // GET query results as data obj
        $.getJSON(queryS, function (data) {

            let scoreDict = {};
            let sortedScoreDict = {};
            // generate score array and score dict key = score, value = id
            for (let i = 0; i < data.items.length; i++) {
                scoreArr.push(idDict[data.items[i].question_id]);
                scoreDict[idDict[data.items[i].question_id]] = data.items[i].question_id;
            }

            // sort score values
            scoreArr.sort(function (a, b) {
                return b - a;
            });

            // sorted score dict key = score, value = id
            for (let i = 0; i < data.items.length; i++) {
                sortedScoreDict[scoreArr[i]] = scoreDict[scoreArr[i]];
            }


            for (let i = 0; i < data.items.length; i++) {
                sortedIDArr.push(sortedScoreDict[scoreArr[i]]);
            }

            dataTable(data)

        });
    }
}

$(document).ready(function () {
    // executes when HTML-Document is loaded and DOM is ready
    getData()
});


function dataTable(data) {

    let title = "";
    let link = "";
    let score = 0;
    let date;
    console.log(data)
    for (let j = 0; j < data.items.length; j++) {
        title = data.items[j].title;
        link = data.items[j]["link"];
        question_id = data.items[j].question_id;
        score = Math.round(idDict[question_id] * 10000) / 100;
        date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
        accepted_answer_id = data.items[j].accepted_answer_id;
        answer_count = data.items[j].answer_count;
        if (accepted_answer_id !== undefined) {

            $('#tbody-results').append(
                $('<tr>').attr('href', link).attr('target', '_blank').append(
                    $('<td>').addClass('m-0 font-weight-bold text-success').text("Verified Answer"),
                    $('<td>').addClass('m-0 font-weight-bold text-success').text(score + "%"),
                    $('<td>').append(
                        $('<a>').html(title).attr("href", link).attr("target", "_blank")
                    ), $('<td>').text(date)
                ))
        } else if (answer_count > 0) {

            $('#tbody-results').append(
                $('<tr>').attr('href', link).attr('target', '_blank').append(
                    $('<td>').addClass('m-0 font-weight-bold text-warning').text("Unverified Answers"),
                    $('<td>').addClass('m-0 font-weight-bold text-warning').text(score + "%"),
                    $('<td>').append(
                        $('<a>').html(title).attr("href", link).attr("target", "_blank")
                    ), $('<td>').text(date)
                ))

        } else {

            $('#tbody-results').append(
                $('<tr>').attr('href', link).attr('target', '_blank').append(
                    $('<td>').addClass('m-0 font-weight-bold text-danger').text("Not Answered"),
                    $('<td>').addClass('m-0 font-weight-bold text-danger').text(score + "%"),
                    $('<td>').append(
                        $('<a>').html(title).attr("href", link).attr("target", "_blank")
                    ),
                    $('<td>').text(date)
                ))
        }
    }


    $('#dt-filter-select').dataTable({
        order: [[1, "desc"]],
        bFilter: true,
        columnDefs: [
            {
                targets: [0],
                searchable: true,
                visible: true,
            },
            {
                targets: [3],
                render: function (data, type, row) {
                    if (type === 'sort') {
                        return Date.parse(data);
                    }
                    return data;
                }
            }
        ],
        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                var select = $('<select  class="browser-default custom-select form-control-sm"><option value="" selected>All</option></select>')
                    .appendTo($(column.footer()))
                    .on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );

                        column
                            .search(val ? '^' + val + '$' : '', true, false)
                            .draw();
                    });

                column.data().unique().sort().each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>')
                });

            });
        },
    });

}
