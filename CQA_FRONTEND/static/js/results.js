// do not display test mode on this page
document.getElementById("modeSelect").style.display = "none";

function swap(json) {
    var ret = {};
    for (var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

$(document).ready(function () {
    // executes when DOM is loded and ready
    dataTable();
});


async function dataTable() {

    // generate batch request to API
    if (resultDict != null) {
        let queryS = "https://api.stackexchange.com/2.2/questions/";
        let queryE = "?order=desc&sort=activity&site=ai&key=" + APIKEY;
        for (let key in resultDict) {
            queryS = queryS + key + ';';
        }

        queryS = queryS.slice(0, -1) + queryE;

        // get questions from API
        $.getJSON(queryS, function (data) {

            let title = "";
            let link = "";
            let score = 0;
            let date;

            // for each question
            for (let j = 0; j < data.items.length; j++) {
                // localize variables for each question
                title = data.items[j].title;
                link = data.items[j]["link"];
                question_id = data.items[j].question_id;
                score = Math.round(resultDict[question_id] * 10000) / 100;
                date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                accepted_answer_id = data.items[j].accepted_answer_id;
                answer_count = data.items[j].answer_count;


                if (accepted_answer_id !== undefined) {     // verified answers

                    $('#tbody-results').append(
                        $('<tr>').attr('href', link).attr('target', '_blank').append(
                            $('<td>').addClass('m-0 font-weight-bold text-success').text("Verified Answer"),
                            $('<td>').addClass('m-0 font-weight-bold text-success').text(score + "%"),
                            $('<td>').append(
                                $('<a>').html(title).attr("href", link).attr("target", "_blank")
                            ), $('<td>').text(date)
                        ))

                } else if (answer_count > 0) {      // unverified answers


                    $('#tbody-results').append(
                        $('<tr>').attr('href', link).attr('target', '_blank').append(
                            $('<td>').addClass('m-0 font-weight-bold text-warning').text("Unverified Answers"),
                            $('<td>').addClass('m-0 font-weight-bold text-warning').text(score + "%"),
                            $('<td>').append(
                                $('<a>').html(title).attr("href", link).attr("target", "_blank")
                            ), $('<td>').text(date)
                        ))

                } else {

                    $('#tbody-results').append( // not answered at all
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

            // initialize datatable
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
        });
    }
}
