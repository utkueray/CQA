let stackOverflowIDAQ = "";
let idDict;

if (accountID != null || accessToken != null) {

    $.getJSON("https://api.stackexchange.com/2.2/users/" + accountID + "/associated?filter=!*K3Z9x9w-2fKbidf&key=" + APIKEY, function (data_account) {
        //data is the JSON string
        let items = data_account.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].site_name === "Stack Overflow") {
                stackOverflowIDAQ = items[i].user_id;
                userData.stackOverflowIDAQ = items[i].user_id;
            }
        }

        $.getJSON("https://api.stackexchange.com/2.2/users/" + stackOverflowIDAQ + "/questions?order=desc&sort=activity&site=stackoverflow&key=" + APIKEY, function (data_question) {
            for (let i = 0; i < data_question.items.length; i++) {
                let title = data_question.items[i].title;
                let d = document.createElement('div');
                d.innerHTML = data_question.items[i].title;
                title = d.innerText;
                let link = data_question.items[i].link;
                let question_id = data_question.items[i].question_id;
                $("#suggestions").append(
                    $('<div>').append(
                        $('<div>').addClass('card shadow mb-4').append(
                            $('<a>').addClass('h5 font-weight-bold btn underline card-title primary-color').text(title).attr('href', link).attr('target', '_blank').css("text-align","left").css("text-decoration", "underline"),
                            $('<div>').attr('id', 'table' + question_id).css('margin', '20px')
                        ),
                    )
                )
            }
            for (let ids in resultDict) {
                console.log(ids);

                if (resultDict[ids] != null) {

                    let queryS = "https://api.stackexchange.com/2.2/questions/";
                    let queryE = "?order=desc&sort=activity&site=ai&key=" + APIKEY;
                    for (let key in resultDict[ids]) {
                        queryS = queryS + key + ';';
                    }
                    // generate a query string
                    queryS = queryS.slice(0, -1) + queryE;
                    // GET query results as data obj
                    $.getJSON(queryS, function (data) {

                        $("#table" + ids).append(
                            $('<table>').addClass("table").attr('id', 'dt-filter-select' + ids).append(
                                $('<thead>').append(
                                    $('<tr>').append(
                                        $('<th>').addClass('th-sm').text("Similarity"),
                                        $('<th>').addClass('th-sm').text("Title"),
                                        $('<th>').addClass('th-sm').text("Date"),
                                    )
                                ),
                                $('<tbody>').attr('id', ids),
                                $('<tfoot>').append(
                                    $('<tr>').append(
                                        //$('<th>').text("Similarity")
                                    )
                                )
                            )
                        )
                        let title = "";
                        let link = "";
                        let score = 0;
                        let date;

                        for (let j = 0; j < data.items.length; j++) {
                            idDict = resultDict[ids]
                            title = data.items[j].title;
                            link = data.items[j]["link"];
                            question_id = data.items[j].question_id;
                            score = Math.round(idDict[question_id] * 10000) / 100;
                            date = new Date(data.items[j].creation_date * 1000).toLocaleDateString("en-GB");
                            accepted_answer_id = data.items[j].accepted_answer_id;
                            answer_count = data.items[j].answer_count;
                            console.log("#tbody-results" + ids)

                            $('#' + ids).append(
                                $('<tr>').attr('href', link).attr('target', '_blank').append(
                                    $('<td>').addClass('m-0 font-weight-bold').text(score + "%"),
                                    $('<td>').append(
                                        $('<a>').html(title).attr("href", link).attr("target", "_blank")
                                    ),
                                    $('<td>').text(date)
                                )
                            )
                        }

                        $('#dt-filter-select' + ids).dataTable({
                            order: [[0, "desc"]],
                            bFilter: true,
                            columnDefs: [
                                {
                                    targets: [2],
                                    render: function (data, type, row) {
                                        if (type === 'sort') {
                                            return Date.parse(data);
                                        }
                                        return data;
                                    }
                                },
                                {
                                    targets: [1],

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
        });
    });

} else {

    alert("Please login with StackExchange account.")
    window.location = "/"
}