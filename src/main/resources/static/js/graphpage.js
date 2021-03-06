$(function () {
    $(".tooltip-options a").tooltip({html: true});
    $("#code-card-body").tooltip({delay:{
            show:1000
        },
        html: true});
    $("#code-header").tooltip({delay:{
            show:1000
        },
        html: true});
    let htmlDecodeByRegExp = function (str) {
        if (str.length == 0) return "";
        let temp = str.replace(/&amp;/g, "&");
        temp = temp.replace(/&lt;/g, "<");
        temp = temp.replace(/&gt;/g, ">");
        // temp = temp.replace(/&nbsp;/g, " ");
        temp = temp.replace(/&#39;/g, "\'");
        temp = temp.replace(/&quot;/g, "\"");
        console.log(temp);
        return temp;
    };

    let htmlEncodeByRegExp = function (str) {
        if (str.length === 0) return "";
        let temp = str.replace(/&/g, "&amp;");
        temp = temp.replace(/</g, "&lt;");
        temp = temp.replace(/>/g, "&gt;");
        // temp = temp.replace(/\s/g, "&nbsp;");
        temp = temp.replace(/\'/g, "&#39;");
        temp = temp.replace(/\"/g, "&quot;");
        console.log(temp);
        return temp;
    };

    $(document).on('keydown', function (e) {
        if (e.ctrlKey && e.which === 83) { // Check for the Ctrl key being pressed, and if the key = [S] (83)
            console.log('Ctrl+S');
            e.preventDefault();
            save();
            return false;
        }
    });

    $(window).bind('beforeunload', function () {
        // localStorage.removeItem("codeId");
        return true;
    });
    let ownCode = true;
    let userId = localStorage['userId'];
    if (userId === undefined) window.location.href = "/login";
    let url = document.location.toString();
    if (!url.includes("?code=")) window.location.href = "/workspace";
    let codeId = Number(url.slice(url.indexOf("?code=") + 6));
    // let codeId = localStorage['codeId'];
    // if (codeId === undefined) window.location.href = "/workspace";

    let save = function () {
        $.ajax({
            type: "post",
            url: "/workSpace/save",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId,
                date: new Date(),
                closeness: $("#range_value").val(),
                cyInfo: JSON.stringify(cy.json())
            }),
            success: function (data) {
                if (data.success) alert("Save success!");
                else alert(data.message);
            },
            error: function (err) {
                console.log(err);
            }
        });
    };
    $("#save-btn").on('click', function () {
        save();
    });
    $("#export-btn").on('click', function () {
        let img = cy.jpg({scala: 10, full: true});
        let link = document.createElement('a');
        link.href = img;
        link.download = "download.jpg";
        link.click();
        delete link;
    });
    let get_v_labels = function (vertexId) {
        $.ajax({
            type: "post",
            url: "/label/getOneVertexLabel",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId,
                vertexId: vertexId
            }),
            success: function (data) {
                if (data.success) {
                    console.log(data);
                    let labels = data.content;
                    let h = "";
                    labels.forEach(function (label) {
                        h += "<div class=\"card m-2\">\n" +
                            "<h5 class=\"card-header\" id=\"lt-" + label.id + "\">" + label.title + "</h5>\n" +
                            "<div class=\"card-body\">\n" +
                            "<div class=\"card-text\" id=\"lc-" + label.id + "\">" +
                            htmlEncodeByRegExp(label.content).replace(/\n/g, "<br>") +
                            "</div>\n" +
                            "<div class=\"mt-3\" style=\"text-align: right\">\n" +
                            (ownCode ? ("<button class=\"btn btn-info label-edit\" " + " labelId=" + label.id + ">Edit</button>\n") : "") +
                            (ownCode ? ("<button class=\"btn btn-danger label-del\" " + " labelId=" + label.id + ">Delete</button>\n") : "") +
                            "</div>\n" +
                            "</div>\n" +
                            "</div>";
                    });
                    $("#labels-container").html(h);
                    $(".label-edit").on('click', function (event) {
                        let id = $(event.target).attr('labelId');
                        $("#labelModal").attr("x-id", 'n' + vertexId);
                        $("#labelModal").attr("label-id", id);
                        $("#title-input").val($("#lt-" + id).text());
                        $("#content-input").val(htmlDecodeByRegExp($("#lc-" + id).html().replace(/<br>/g, "\n")));
                        $("#labelModal").modal('show');
                    });
                    $(".label-del").on('click', function (event) {
                        if (confirm("Sure to delete this label?")) {
                            let id = Number($(event.target).attr('labelId'));
                            $.ajax({
                                type: "post",
                                url: "/label/deleteVertexLabel",
                                headers: {"Authorization": $.cookie('token')},
                                dataType: "json",
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    userId: userId,
                                    codeId: codeId,
                                    id: id
                                }),
                                success: function (data) {
                                    if (data.success) {
                                        get_v_labels(vertexId);
                                    } else {
                                        console.log(data.message);
                                    }
                                },
                                error: function (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    console.log(data.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    };
    let get_e_labels = function (edgeId) {
        $.ajax({
            type: "post",
            url: "/label/getOneEdgeLabel",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId,
                edgeId: edgeId
            }),
            success: function (data) {
                if (data.success) {
                    console.log(data);
                    let labels = data.content;
                    let h = "";
                    labels.forEach(function (label) {
                        h += "<div class=\"card m-2\">\n" +
                            "<h5 class=\"card-header\" id=\"lt-" + label.id + "\">" + label.title + "</h5>\n" +
                            "<div class=\"card-body\">\n" +
                            "<div class=\"card-text\" id=\"lc-" + label.id + "\">" +
                            htmlEncodeByRegExp(label.content).replace(/\n/g, "<br>") +
                            "</div>\n" +
                            "<div class=\"mt-3\" style=\"text-align: right\">\n" +
                            "<button class=\"btn btn-info label-edit\" " + " labelId=" + label.id + ">Edit</button>\n" +
                            "<button class=\"btn btn-danger label-del\" " + " labelId=" + label.id + ">Delete</button>\n" +
                            "</div>\n" +
                            "</div>\n" +
                            "</div>";
                    });
                    $("#labels-container").html(h);
                    $(".label-edit").on('click', function (event) {
                        let id = $(event.target).attr('labelId');
                        $("#labelModal").attr("x-id", 'e' + id);
                        $("#title-input").val($("#lt-" + id).text());
                        $("#content-input").val(htmlDecodeByRegExp($("#lc-" + id).html().replace(/<br>/g, "\n")));
                        $("#labelModal").modal('show');
                    });
                    $(".label-del").on('click', function (event) {
                        if (confirm("Sure to delete this label?")) {
                            let id = Number($(event.target).attr('labelId'));
                            $.ajax({
                                type: "post",
                                url: "/label/deleteEdgeLabel",
                                headers: {"Authorization": $.cookie('token')},
                                dataType: "json",
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    userId: userId,
                                    codeId: codeId,
                                    id: id
                                }),
                                success: function (data) {
                                    if (data.success) {
                                        get_e_labels(edgeId);
                                    } else {
                                        console.log(data.message);
                                    }
                                },
                                error: function (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    console.log(data.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    };
    let get_d_labels = function (firstEdgeId, numOfVertex) {
        $.ajax({
            type: "post",
            url: "/label/getOneDomainLabel",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId,
                firstEdgeId: firstEdgeId,
                numOfVertex: numOfVertex
            }),
            success: function (data) {
                if (data.success) {
                    console.log(data);
                    let labels = data.content;
                    let h = "";
                    labels.forEach(function (label) {
                        h += "<div class=\"card m-2\">\n" +
                            "<h5 class=\"card-header\" id=\"lt-" + label.id + "\">" + label.title + "</h5>\n" +
                            "<div class=\"card-body\">\n" +
                            "<div class=\"card-text\" id=\"lc-" + label.id + "\">" +
                            htmlEncodeByRegExp(label.content).replace(/\n/g, "<br>") +
                            "</div>\n" +
                            "<div class=\"mt-3\" style=\"text-align: right\">\n" +
                            "<button class=\"btn btn-info label-edit\" " + " labelId=" + label.id + ">Edit</button>\n" +
                            "<button class=\"btn btn-danger label-del\" " + " labelId=" + label.id + ">Delete</button>\n" +
                            "</div>\n" +
                            "</div>\n" +
                            "</div>";
                    });
                    $("#labels-container").html(h);
                    $(".label-edit").on('click', function (event) {
                        let id = $(event.target).attr('labelId');
                        $("#labelModal").attr("x-id", 'd' + id);
                        $("#title-input").val($("#lt-" + id).text());
                        $("#content-input").val(htmlDecodeByRegExp($("#lc-" + id).html().replace(/<br>/g, "\n")));
                        $("#labelModal").modal('show');
                    });
                    $(".label-del").on('click', function (event) {
                        if (confirm("Sure to delete this label?")) {
                            let id = Number($(event.target).attr('labelId'));
                            $.ajax({
                                type: "post",
                                url: "/label/deleteDomainLabel",
                                headers: {"Authorization": $.cookie('token')},
                                dataType: "json",
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    userId: userId,
                                    codeId: codeId,
                                    id: id
                                }),
                                success: function (data) {
                                    if (data.success) {
                                        get_d_labels(firstEdgeId, numOfVertex);
                                    } else {
                                        console.log(data.message);
                                    }
                                },
                                error: function (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    console.log(data.message);
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    };


    $("#label_submit").on('click', function () {
        let type = $("#labelModal").attr("x-id")[0];
        let x_id = Number($("#labelModal").attr("x-id").substring(1));
        if (!$("#labelModal").attr("label-id") === undefined) {
            console.log($("#labelModal").attr("label-id"))
        }

        console.log(type, x_id);
        if (type === 'n') {
            $.ajax({
                type: "post",
                url: "/label/noteVertex",
                headers: {"Authorization": $.cookie('token')},
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    id: $("#labelModal").attr("label-id"),
                    userId: userId,
                    codeId: codeId,
                    vertexId: x_id,
                    title: $("#title-input").val(),
                    content: $("#content-input").val()
                }),
                success: function (data) {
                    if (data.success) {
                        console.log("success");
                        $("#labelModal").modal('hide');
                        get_v_labels(x_id);
                    } else {
                        console.log(data.message);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        } else if (type === 'e') {
            $.ajax({
                type: "post",
                url: "/label/noteEdge",
                headers: {"Authorization": $.cookie('token')},
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    id: $("#labelModal").attr("label-id"),
                    userId: userId,
                    codeId: codeId,
                    edgeId: x_id,
                    title: $("#title-input").val(),
                    content: $("#content-input").val()
                }),
                success: function (data) {
                    if (data.success) {
                        console.log("success");
                        $("#labelModal").modal('hide');
                        get_e_labels(x_id);
                    } else {
                        console.log(data.message);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        } else if (type === 'd') {
            let firstEdgeId = $('#labelModal').attr("firstEdgeId");
            let numOfVertex = $('#labelModal').attr("numOfVertex");
            $.ajax({
                type: "post",
                url: "/label/noteDomain",
                headers: {"Authorization": $.cookie('token')},
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    firstEdgeId: firstEdgeId,
                    numOfVertex: numOfVertex,
                    id: $("#labelModal").attr("label-id"),
                    userId: userId,
                    codeId: codeId,
                    title: $("#title-input").val(),
                    content: $("#content-input").val()
                }),
                success: function (data) {
                    if (data.success) {
                        console.log("success");
                        $("#labelModal").modal('hide');
                        get_d_labels(firstEdgeId, numOfVertex);
                    } else {
                        console.log(data.message);
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            })
        }

    });

    let update_info = function (v_num, e_num, d_num) {
        let t = "<tr><th scope=\"row\">Vertices</th><td>" + v_num.toString() + "</td></tr>" +
            "<tr><th scope=\"row\">Edges</th><td>" + e_num.toString() + "</td></tr>" +
            "<tr><th scope=\"row\">Domains</th><td>" + d_num.toString() + "</td></tr>";
        $("#info-table-body").html(t);
    };

    // constructs the suggestion engine
    let states = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // `states` is an array of state names defined in "The Basics"
        remote: {
            url: '/graph/findVertex?functionName=%QUERY',
            wildcard: '%QUERY',
            transform: function (data) {
                console.log(data);
                let names = [];
                data.content.forEach(function (func) {
                    names.push(func.fullName);
                });
                // Map the remote source JSON array to a JavaScript object array
                return names;
            }
        }
    });

    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'states',
        source: states
    });

    let search_by_id = function (id) {
        console.log(id);
        expand_tree(id);
        cy.$('node,edge').unselect();
        let n = cy.$id(id);
        console.log(n);
        if (n.length === 0) {
            alert("This node has been filtered out. Please adjust filter weights.")
        } else {
            n.select();
            cy.fit(n, $('#cy_container').height() * 0.05);
            let info = n.data("full_info");
            get_code(info);
            get_v_labels(Number(id.substring(1)));
        }
    };

    $('#searchModal').on('shown.bs.modal', function () {
        if ($('#search-nodes-tab').attr("aria-selected") === "true") {
            $('#func-name-input').focus();
        }
        else {
            $('#start-node-input').focus();
        }
    });

    $('#search-nodes-tab').on('click', function () {
        $('#func-name-input').focus();
    });

    $('#search-paths-tab').on('click', function () {
        $('#start-node-input').focus();
    });

    $("#node-search-btn").on("click", function () {
        if ($("#func-name-input").val() === "") {
            alert("Input can't be empty.");
            return;
        }
        $.ajax({
            type: "get",
            url: "/graph/findVertex?functionName=" + $("#func-name-input").val(),
            headers: {"Authorization": $.cookie('token')},
            success: function (data) {
                console.log(data);
                if (data.content.length === 0) {
                    alert("Can't find such node.");
                    return;
                }
                if (data.content.length > 1) {
                    $("#ambiguousLabel").text("Input \"Function Name\" is ambiguous. Choose one below:");
                    $("#ambiguousFuncSelect1").html("");
                    data.content.forEach(function (func) {
                        $("#ambiguousFuncSelect1").append("<option value='" + func.id + "'>" + htmlEncodeByRegExp(func.fullName) + "</option>");
                    });
                    $("#ambiguousModal").modal('show');
                    $("#ambiguous_submit1").on('click', function () {
                        let id = 'n' + $("#ambiguousFuncSelect1").find("option:selected").val();
                        search_by_id(id);
                        $("#ambiguousModal1").modal('hide');
                        $("#searchModal").modal('hide');
                    });
                    return;
                }
                let id = 'n' + data.content[0].id.toString();
                search_by_id(id);
                $("#searchModal").modal('hide');
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    let search_by_start_end = function (start_id, end_id) {
        console.log(start_id, end_id);
        $.ajax({
            type: "post",
            url: "/graph/findPath",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify([{id: start_id}, {id: end_id}]),
            success: function (data) {
                console.log(data);
                if (data.success) {
                    let n = data.content.pathNum;
                    let paths = data.content.pathVOS;
                    if (n === 0) {
                        alert("No path found");
                        return;
                    }
                    let all_edges = [];
                    let all_nodes = [];
                    paths.forEach(function (path) {
                        path.edges.forEach(function (edge) {
                            let id = edge.id;
                            let e = cy.$id('e' + id.toString());
                            if (e.length === 0) {

                            } else {
                                all_edges.push(e[0]);
                                all_nodes.push(e[0].source());
                                all_nodes.push(e[0].target());
                            }
                        })
                    });
                    cy.$('node,edge').unselect();
                    all_edges.forEach(function (edge) {
                        edge.select();
                    });
                    all_nodes.forEach(function (node) {
                        node.select();
                    });
                    cy.fit(cy.$('node:selected'), $('#cy_container').height() * 0.25);
                } else {
                    alert("No path found");
                }
            },
            error: function (err) {
                console.log(err);
            }
        })
    };

    $("#path-search-btn").on("click", function () {
        if ($("#start-node-input").val() === "" || $("#end-node-input").val() === "") {
            alert("Input can't be empty.");
            return;
        }
        let start_id = -1;
        let end_id = -1;
        $.when(
            $.ajax({
                type: "get",
                url: "/graph/findVertex?functionName=" + $("#start-node-input").val().toString(),
                headers: {"Authorization": $.cookie('token')},
                error: function (err) {
                    console.log(err);
                }
            }),
            $.ajax({
                type: "get",
                url: "/graph/findVertex?functionName=" + $("#end-node-input").val().toString(),
                headers: {"Authorization": $.cookie('token')},
                error: function (err) {
                    console.log(err);
                }
            })
        ).done(
            function (data1, data2) {
                console.log(data1);
                if (data1[0].content.length === 0) {
                    alert("Can't find such start node.");
                    return;
                }
                start_id = data1[0].content[0].id;
                console.log(data2);
                if (data2[0].content.length === 0) {
                    alert("Can't find such end node.");
                    return;
                }
                end_id = data2[0].content[0].id;

                if (data1[0].content.length > 1 && data2[0].content.length > 1) {
                    $("#ambiguousLabel1").text("Input \"Start Node\" is ambiguous. Choose one below:");
                    $("#ambiguousFuncSelect1").html("");
                    data1[0].content.forEach(function (func) {
                        $("#ambiguousFuncSelect1").append("<option value='" + func.id + "'>" + htmlEncodeByRegExp(func.fullName) + "</option>");
                    });
                    $("#ambiguousLabel2").text("Input \"End Node\" is ambiguous. Choose one below:");
                    $("#ambiguousFuncSelect2").html("");
                    data2[0].content.forEach(function (func) {
                        $("#ambiguousFuncSelect2").append("<option value='" + func.id + "'>" + htmlEncodeByRegExp(func.fullName) + "</option>");
                    });
                    $("#ambiguousModal1").modal('show');
                    $("#ambiguous_submit1").on('click', function () {
                        let start_id = Number($("#ambiguousFuncSelect1").find("option:selected").val());
                        $("#ambiguous_submit2").on('click', function () {
                            let end_id = Number($("#ambiguousFuncSelect2").find("option:selected").val());
                            search_by_start_end(start_id, end_id);
                            $("#ambiguousModal2").modal('hide');
                            $("#searchModal").modal('hide');
                        });
                        $("#ambiguousModal2").modal('show');
                        $("#ambiguousModal1").modal('hide');
                    });
                    return;
                } else if (data1[0].content.length > 1) {
                    $("#ambiguousLabel1").text("Input \"Start Node\" is ambiguous. Choose one below:");
                    $("#ambiguousFuncSelect1").html("");
                    data1[0].content.forEach(function (func) {
                        $("#ambiguousFuncSelect1").append("<option value='" + func.id + "'>" + htmlEncodeByRegExp(func.fullName) + "</option>");
                    });
                    $("#ambiguousModal1").modal('show');
                    $("#ambiguous_submit1").on('click', function () {
                        let start_id = Number($("#ambiguousFuncSelect1").find("option:selected").val());
                        search_by_start_end(start_id, end_id);
                        $("#ambiguousModal1").modal('hide');
                        $("#searchModal").modal('hide');
                    });
                    return;
                } else if (data2[0].content.length > 1) {
                    $("#ambiguousLabel1").text("Input \"End Node\" is ambiguous. Choose one below:");
                    $("#ambiguousFuncSelect1").html("");
                    data2[0].content.forEach(function (func) {
                        $("#ambiguousFuncSelect1").append("<option value='" + func.id + "'>" + htmlEncodeByRegExp(func.fullName) + "</option>");
                    });
                    $("#ambiguousModal1").modal('show');
                    $("#ambiguous_submit1").on('click', function () {
                        let end_id = Number($("#ambiguousFuncSelect1").find("option:selected").val());
                        search_by_start_end(start_id, end_id);
                        $("#ambiguousModal1").modal('hide');
                        $("#searchModal").modal('hide');
                    });
                    return;
                } else {
                    search_by_start_end(start_id, end_id);
                    $("#searchModal").modal('hide');
                }
            }
        );

    });
    //initialize cytoscape
    let cy = cytoscape();
    let fcose_layout = {
        name: 'fcose',
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingVertical: 100,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingHorizontal: 100,
        nodeRepulsion: 450000,
        idealEdgeLength: 150,
        stop: function () {
            $('#loading').hide();
        }
    };
    let concentric_layout = {
        name: 'concentric',
        minNodeSpacing: 50,
        concentric: function (node) {
            return node.degree();
        },
        levelWidth: function (nodes) { // the letiation of concentric values in each level
            return 0.5;
        },
        stop: function () {
            $('#loading').hide();
        }
    };
    let cose_bilkent_layout = {
        name: 'cose-bilkent',
        randomize: true,
        stop: function () {
            $('#loading').hide();
        }
    };
    let preset_layout = {
        name: 'preset',
        stop: function () {
            $('#loading').hide();
        }
    };

    let refresh = function () {
        let max = 0;
        cy.$('.domain').forEach(function (d) {
            if (d.data('numOfVertex') > max) max = d.data('numOfVertex');
        });
        console.log(max);
        if (max > 300) {
            let tip = `<div class="alert alert-warning alert-dismissible fade show m-2" role="alert"
    style="z-index: 3;" id="number-alert">
    The elements on the graph are too much now. You can adjust <a data-toggle="modal" data-target="#filterModal">CLOSENESS</a> to filter out weak dependencies.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>`;
            $("#tips").html(tip);
        } else $("#tips").html("");
        if (cy.$("node").length < 1000) cy.layout(cose_bilkent_layout).run();
        else cy.layout(fcose_layout).run();
    };

    $("#refresh-btn").on('click', function () {
        if (confirm("Sure to refresh the layout? This will take a few seconds.")) {
            $("#loading").show();
            refresh();
        }
    });

    //code on the right
    let get_code = function (info) {
        $.ajax({
            type: "post",
            url: "/code/getFuncCode",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId,
                vertexVO: info,
            }),
            success: function (data) {
                console.log(data);
                $("#code-header").text(info["belongClass"] + ":" + info["funcName"] + "(" + info["args"].join(",") + ")");
                if (data.success) {
                    $("#code-pre").html("<code>" + data.content.replace(/\n\t/g, "\n").substring(1) + "</code>");
                } else {
                    $("#code-pre").html("<code>" + data.message + "</code>");
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    };

    //treeview on the left sidebar
    let remove_empty_node = function (tree) {
        tree.nodes.forEach(function (sub_tree) {
            if (sub_tree.nodes.length === 0) {
                delete sub_tree.nodes;
            } else {
                remove_empty_node(sub_tree);
            }
        });
    };

    $.ajax({
        type: "post",
        url: "/code/getCodeStructure",
        headers: {"Authorization": $.cookie('token')},
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            userId: userId,
            codeId: codeId
        }),
        success: function (data) {
            let tree_json = [data.content];
            tree_json.forEach(function (tree) {
                remove_empty_node(tree);
            });
            console.log(tree_json);
            $('#tree').treeview({
                data: tree_json,
                backColor: "#f8f9fa",
                color: "#000000",
                showBorder: false,
                expandIcon: "fa fa-caret-right",
                collapseIcon: "fa fa-caret-down",
                highlightSelected: true,
                onNodeSelected: function (event, data) {
                    console.log(event);
                    console.log(data);
                    if (data.vertexId !== -1) {
                        cy.$('node,edge').unselect();
                        let n = cy.$id('n' + data.vertexId.toString());
                        console.log(n);
                        if (n.length === 0) {
                            alert("This node has been filtered out. Please adjust filter weights.")
                        } else {
                            n.select();
                            cy.fit(n, $('#cy_container').height() * 0.45);
                            let info = n.data("full_info");
                            get_code(info);
                        }
                        get_v_labels(data.vertexId);
                    }
                }
            });
        },
        error: function (err) {
            console.log(err);
        }
    });

    let expand_tree = function (id) {
        let treeViewObject = $('#tree').data('treeview');
        let allCollapsedNodes = treeViewObject.getCollapsed(),
            allExpandedNodes = treeViewObject.getExpanded(),
            allNodes = allCollapsedNodes.concat(allExpandedNodes);
        let nodeId = -1;
        allNodes.forEach(function (node) {
            if (id === 'n' + node.vertexId.toString()) {
                nodeId = node.nodeId;
            }
        });
        console.log(nodeId);
        $('#tree').treeview('collapseAll', {silent: true});
        $('#tree').treeview('revealNode', [nodeId, {silent: true}]);
        $('#tree').treeview('selectNode', [nodeId, {silent: true}]);
        $(".node-selected")[0].scrollIntoView({
            behavior: "smooth", // or "auto" or "instant"
            block: "start" // or "end"
        });
    };

    //cytoscape container on the middle main div

    $.ajax({
        type: "post",
        url: "/workSpace/recover",
        headers: {"Authorization": $.cookie('token')},
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            userId: userId,
            codeId: codeId
        }),
        success: function (data) {
            if (data.success) {
                console.log(JSON.parse(data.content.cyInfo));
                cy = cytoscape({
                    container: document.getElementById('cy_container'),
                });
                cy.json(JSON.parse(data.content.cyInfo));
                cy.layout(preset_layout).run();
                setCyStyle();
                setCyEvents();
                update_info(cy.$("node.vertex").length,
                    cy.$("edge").length,
                    cy.$("node.domain").length);
                $("#ctm-range").val(data.content.closeness);
                $("#range_value").val(data.content.closeness);
            } else {
                getGraph();
            }
        },
        error: function (err) {
            console.log(err);
        }
    });

    let setCyEvents = function () {
        cy.on('tap', 'node.vertex', function (event) {
            expand_tree(event.target.data("id"));
            get_v_labels(Number(event.target.data("id").substring(1)));

            console.log('selected');
            console.log(event.target.data());
            let info = event.target.data("full_info");
            get_code(info);
        });
        cy.on('tap', 'edge', function (event) {
            get_e_labels(Number(event.target.data("id").substring(1)));
        });
        cy.on('tap', 'node.domain', function (event) {
            get_d_labels(event.target.data("firstEdgeId"), event.target.data("numOfVertex"));
        });

        cy.cxtmenu({
            selector: 'node.vertex.favor',
            commands: [
                // {
                //     content: '<span class="fa fa-arrows-alt fa-2x"></span>',
                //     select: function (ele) {
                //         expand_tree(ele.data("id"));
                //         get_v_labels(Number(ele.data("id").substring(1)));
                //
                //         let info = ele.data("full_info");
                //         get_code(info);
                //
                //         cy.$('node,edge').unselect();
                //         console.log('this id', ele.id());
                //         ele.select();
                //         let neighborhoods = ele.neighborhood();
                //         neighborhoods.forEach(function (nb) {
                //             console.log('neighbor id', nb.id());
                //             nb.select();
                //         });
                //         cy.fit(cy.$('node:selected'), $('#cy_container').height() * 0.25);
                //     }
                // },

                {
                    content: '<span style="color:#faff62;" class="fa fa-lightbulb-o fa-2x"></span>',
                    select: function (ele) {
                        ele.removeClass('favor');
                        ele.removeData('favor');
                        ele=cy.$(':selected');
                        ele.removeClass('favor');
                        ele.removeData('favor');
                    },
                    // enabled: false
                },

                {
                    content: '<span class="fa fa-bookmark fa-2x"></span>',
                    select: function (ele) {
                        cy.$('node,edge').unselect();
                        ele.select();
                        $("#labelModal").removeAttr('label-id');
                        $("#labelModal").attr('x-id', ele.data("id"));
                        $("#title-input").val("");
                        $("#content-input").val("");
                        $("#labelModal").modal('show');
                    }
                }
            ],
            menuRadius: 70,
            indicatorSize: 12,
            minSpotlightRadius: 12,
        });

        cy.cxtmenu({
            selector: 'edge.favor',
            commands: [
                // {
                //     content: '<span class="fa fa-arrows-alt fa-2x"></span>',
                //     select: function (ele) {
                //         get_e_labels(Number(ele.data("id").substring(1)));
                //
                //         cy.$('node,edge').unselect();
                //         console.log('this id', ele.id());
                //         ele.select();
                //         let neighborhoods = ele.neighborhood();
                //         neighborhoods.forEach(function (nb) {
                //             console.log('neighbor id', nb.id());
                //             nb.select();
                //         });
                //         cy.fit(cy.$('node:selected'), $('#cy_container').height() * 0.25);
                //     }
                // },

                {
                    content: '<span style="color:#faff62;" class="fa fa-lightbulb-o fa-2x"></span>',
                    select: function (ele) {
                        ele.removeClass('favor');
                        ele.removeData('favor');
                        ele=cy.$(':selected');
                        ele.removeClass('favor');
                        ele.removeData('favor');
                    },
                    // enabled: false
                },

                {
                    content: '<span class="fa fa-bookmark fa-2x"></span>',
                    select: function (ele) {
                        cy.$('node,edge').unselect();
                        ele.select();
                        $("#labelModal").removeAttr('label-id');
                        $("#labelModal").attr('x-id', ele.data("id"));
                        $("#title-input").val("");
                        $("#content-input").val("");
                        $("#labelModal").modal('show');
                    }
                }
            ],
            menuRadius: 70,
            indicatorSize: 12,
            minSpotlightRadius: 12,
        });

        cy.cxtmenu({
            selector: 'node.vertex[^favor]',
            commands: [
                // {
                //     content: '<span class="fa fa-arrows-alt fa-2x"></span>',
                //     select: function (ele) {
                //         expand_tree(ele.data("id"));
                //         get_v_labels(Number(ele.data("id").substring(1)));
                //
                //         let info = ele.data("full_info");
                //         get_code(info);
                //
                //         cy.$('node,edge').unselect();
                //         console.log('this id', ele.id());
                //         ele.select();
                //         let neighborhoods = ele.neighborhood();
                //         neighborhoods.forEach(function (nb) {
                //             console.log('neighbor id', nb.id());
                //             nb.select();
                //         });
                //         cy.fit(cy.$('node:selected'), $('#cy_container').height() * 0.25);
                //     }
                // },

                {
                    content: '<span class="fa fa-lightbulb-o fa-2x"></span>',
                    select: function (ele) {
                        ele.addClass('favor');
                        ele.data('favor', true);
                        ele=cy.$(':selected');
                        ele.addClass('favor');
                        ele.data('favor', true);
                    },
                },

                {
                    content: '<span class="fa fa-bookmark fa-2x"></span>',
                    select: function (ele) {
                        cy.$('node,edge').unselect();
                        ele.select();
                        $("#labelModal").removeAttr('label-id');
                        $("#labelModal").attr('x-id', ele.data("id"));
                        $("#title-input").val("");
                        $("#content-input").val("");
                        $("#labelModal").modal('show');
                    }
                }
            ],
            menuRadius: 70,
            indicatorSize: 12,
            minSpotlightRadius: 12,
        });

        cy.cxtmenu({
            selector: 'edge[^favor]',
            commands: [
                // {
                //     content: '<span class="fa fa-arrows-alt fa-2x"></span>',
                //     select: function (ele) {
                //         get_e_labels(Number(ele.data("id").substring(1)));
                //
                //         cy.$('node,edge').unselect();
                //         console.log('this id', ele.id());
                //         ele.select();
                //         ele.source().select();
                //         ele.target().select();
                //         cy.fit(cy.$('node:selected'), $('#cy_container').height() * 0.25);
                //     }
                // },

                {
                    content: '<span class="fa fa-lightbulb-o fa-2x"></span>',
                    select: function (ele) {
                        ele.addClass('favor');
                        ele.data('favor', true);
                        ele=cy.$(':selected');
                        ele.addClass('favor');
                        ele.data('favor', true);

                        // ele.source().addClass('favor');
                        // ele.source().data('favor', true);
                        // ele.target().addClass('favor');
                        // ele.target().data('favor', true);
                    },
                    // enabled: false
                },

                {
                    content: '<span class="fa fa-bookmark fa-2x"></span>',
                    select: function (ele) {
                        cy.$('node,edge').unselect();
                        ele.select();
                        $("#labelModal").removeAttr('label-id');
                        $("#labelModal").attr('x-id', ele.data("id"));
                        $("#title-input").val("");
                        $("#content-input").val("");
                        $("#labelModal").modal('show');
                    }
                }
            ],
            menuRadius: 70,
            indicatorSize: 12,
            minSpotlightRadius: 12,
        });

        cy.cxtmenu({
            selector: 'node.domain',
            commands: [
                // {
                //     content: '<span class="fa fa-arrows-alt fa-2x"></span>',
                //     select: function (ele) {
                //         cy.fit(ele);
                //     }
                // },

                {
                    content: '<span class="fa fa-bookmark fa-2x"></span>',
                    select: function (ele) {
                        get_d_labels(ele.data("firstEdgeId"), ele.data("numOfVertex"));

                        cy.$('node,edge').unselect();
                        ele.select();
                        $("#labelModal").removeAttr('label-id');
                        $("#labelModal").attr('x-id', ele.data("id"));
                        $("#labelModal").attr('firstEdgeId', ele.data("firstEdgeId"));
                        $("#labelModal").attr('numOfVertex', ele.data("numOfVertex"));
                        $("#title-input").val("");
                        $("#content-input").val("");
                        $("#labelModal").modal('show');
                    }
                }
            ],
            menuRadius: 70,
            indicatorSize: 12,
            minSpotlightRadius: 12,
        });

        cy.style();
    };

    let setCyStyle = function () {
        cy.style([ // the stylesheet for the graph
            {
                selector: 'node.vertex',
                style: {
                    'width': function (ele) {
                        return Math.ceil(30 * (1 + Math.log(ele.outdegree()) / Math.log(2)));
                    },
                    'height': function (ele) {
                        return Math.ceil(30 * (1 + Math.log(ele.outdegree()) / Math.log(2)));
                    },
                    'background-color': '#9EC9FF',
                    'border-width': 1,
                    'border-color': '#5B8FF9',
                    'label': function (ele) {
                        console.log(ele.data('full_info')['belongClass']);
                        let full_info = ele.data('full_info');
                        if (full_info['funcName'] === '<init>') {
                            return ele.data('full_info')['belongClass'] + ":" + ele.data('full_info')['belongClass'];
                        }
                        return ele.data('full_info')['belongClass'] + ":" + ele.data('full_info')['funcName'];
                    },
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'opacity': 'data(closeness)',
                    'line-color': '#5B8FF9',
                    'curve-style': 'straight',
                    'target-endpoint': 'outside-to-node',
                    'target-arrow-shape': 'vee',
                    'target-arrow-color': '#5B8FF9',
                    'target-arrow-fill': 'filled',
                    'arrow-scale': 2
                }
            },
            {
                selector: 'node[label]',
                style: {

                    'font-family': 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }
            },
            {
                selector: 'node.domain',
                style: {
                    'background-opacity': 0.1,
                    'background-color': '#9EC9FF',
                    'border-color': '#9EC9FF'
                }
            },
            {
                selector: 'node.favor',
                style: {
                    'background-color': '#f2c0ff',
                    'border-color': '#e295ec',
                }
            },
            {
                selector: 'edge.favor',
                style: {
                    'line-color': '#e295ec',
                    'target-arrow-color': '#e295ec',
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'background-color': '#b8ffcb',
                    'border-color': '#33e17e',
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#33e17e',
                    'target-arrow-color': '#33e17e',
                }
            },
        ])
    };

    let getGraph = function () {
        $.ajax({
            type: "post",
            url: "/graph/getGraph",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                codeId: codeId
            }),
            timeout: 10000,
            success: function (data) {
                console.log(data);
                console.log(JSON.stringify(data).length);
                let graphData = {
                    nodes: [],
                    edges: [],
                };
                data.content.domainSetVO.domainVOs.forEach(function (domain) {
                    graphData.nodes.push({
                        data: {
                            id: 'd' + domain.id.toString(),
                            numOfVertex: domain.vertices.length,
                            firstEdgeId: domain.edgeVOS[0].id,
                        },
                        classes: ['domain'],
                    });
                    let vertices = domain.vertices;
                    vertices.forEach(function (vertex) {
                        graphData.nodes.push({
                            data: {
                                id: 'n' + vertex.id.toString(),
                                label: vertex.funcName,
                                parent: 'd' + domain.id.toString(),
                                full_info: {
                                    belongPackage: vertex.belongPackage,
                                    belongClass: vertex.belongClass,
                                    funcName: vertex.funcName,
                                    args: vertex.args,
                                }
                            },
                            classes: ['vertex'],
                        });
                    });
                    let edges = domain.edgeVOS;
                    edges.forEach(function (edge) {
                        graphData.edges.push({
                            data: {
                                id: 'e' + edge.id.toString(),
                                source: 'n' + edge.start.id.toString(),
                                target: 'n' + edge.end.id.toString(),
                                closeness: edge.weights[0].weightValue
                            }
                        });
                    });
                });
                console.log(graphData);
                update_info(graphData.nodes.length - data.content.domainSetVO.domainVOs.length,
                    graphData.edges.length,
                    data.content.domainSetVO.domainVOs.length);

                cy = cytoscape({

                    container: document.getElementById('cy_container'), // container to render in

                    elements: {
                        nodes: graphData.nodes,
                        edges: graphData.edges,
                    },

                    wheelSensitivity: 0.5,
                    minZoom: 0.08,
                    maxZoom: 2.00
                });
                setCyStyle();
                refresh();
                // cy.layout(cose_bilkent_layout).run();

                setCyEvents();

                console.log(JSON.stringify(cy.json()).length);
            },
            error: function (err) {
                console.log(err);
            }
        });
    };


    //buttons on the middle main div
    $("#layout-btn").on("click", function () {
        cy.fit();
    });
    $("#filter_search").on("click", function () {
        $('#loading').show();
        $.ajax({
            type: "post",
            url: "graph/filter",
            headers: {"Authorization": $.cookie('token')},
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify([{
                "weightName": "closeness",
                "weightValue": $("#range_value").val()
            }]),
            success: function (data) {
                console.log(data);
                console.log(JSON.stringify(data).length);
                let graphData = {
                    nodes: [],
                    edges: [],
                };
                data.content.domainSetVO.domainVOs.forEach(function (domain) {
                    graphData.nodes.push({
                        data: {
                            id: 'd' + domain.id.toString(),
                            numOfVertex: domain.vertices.length,
                            firstEdgeId: domain.edgeVOS[0].id,
                        },
                        classes: ['domain'],
                    });
                    let vertices = domain.vertices;
                    vertices.forEach(function (vertex) {
                        graphData.nodes.push({
                            data: {
                                id: 'n' + vertex.id.toString(),
                                label: vertex.belongClass + vertex.funcName,
                                parent: 'd' + domain.id.toString(),
                                full_info: {
                                    belongPackage: vertex.belongPackage,
                                    belongClass: vertex.belongClass,
                                    funcName: vertex.funcName,
                                    args: vertex.args,
                                }
                            },
                            classes: ['vertex'],
                        });
                    });
                    let edges = domain.edgeVOS;
                    edges.forEach(function (edge) {
                        graphData.edges.push({
                            data: {
                                id: 'e' + edge.id.toString(),
                                source: 'n' + edge.start.id.toString(),
                                target: 'n' + edge.end.id.toString(),
                                closeness: edge.weights[0].weightValue
                            }
                        });
                    });
                });

                update_info(graphData.nodes.length - data.content.domainSetVO.domainVOs.length,
                    graphData.edges.length,
                    data.content.domainSetVO.domainVOs.length);

                cy.elements().remove();
                $("#filterModal").modal('hide');
                cy.json({
                    elements: {
                        nodes: graphData.nodes,
                        edges: graphData.edges,
                    }
                });
                // cy.layout(fcose_layout).run();
                refresh();
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    //导航栏显示code名称
    $.ajax({
        type: "get",
        url: "code/getCodeInfo/" + codeId,
        headers: {"Authorization": $.cookie('token')},
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            if (data.success === true) {
                let codeName = data.content.name;
                console.log(codeName);
                $("#graph-body").prepend("<button id='code-name' class='btn code-name' >Project: " + codeName + "</button>");
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    //code on the right sidebar
    //labels on the right sidebar

    //当用户查看不属于自己的代码时
    $.ajax({
        type: "get",
        url: "code/getCodeInfo/" + codeId,
        headers: {"Authorization": $.cookie('token')},
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            let codeData = data;

            $.ajax({
                type: "get",
                url: "user/getUserName/" + codeData.content.userId,
                headers: {"Authorization": $.cookie('token')},
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    let authorData = data;

                    $.ajax({
                        type: "get",
                        url: "statistics/getCodeMesVO/" + codeId,
                        headers: {"Authorization": $.cookie('token')},
                        dataType: "json",
                        contentType: "application/json",
                        success: function (data) {
                            if (authorData.success !== true) {
                                alert(authorData.message);
                            } else if (data.success === false) {
                                alert(data.message);
                            } else if (codeData.success === true && codeData.content.userId.toString() !== userId.toString()) {
                                $(window).unbind();
                                ownCode = false;
                                let navbar = $("#top-navbar");
                                let children = navbar.children("div");
                                let len = children.length;
                                for (let i = 0; i < len; i++) {
                                    children[i].remove();
                                }
                                let codeStatistics = data;
                                if (codeStatistics.length !== 6) {
                                    alert("statistics error.");
                                }
                                let numOfVertex = data[0];
                                let numOfEdge = data[2];
                                let numOfDomain = data[4];
                                navbar.append("<div class=\"collapse navbar-collapse col-10 px-0\">\n" +
                                    "<div class='d-flex ml-auto' style='color: #dee2e6;font-size: 20px'>" +
                                    "<label  style='margin: 0.1rem 3rem 0 2rem; color: white;font-size: 24px'>Author:&ensp;" + authorData.content + "</label>" +
                                    "<label class='mx-2' style='margin-bottom: 0;margin-top: 0.3rem'>vertex:" + numOfVertex.toString() + "</label>" +
                                    "<label class='mx-2' style='margin-bottom: 0;margin-top: 0.3rem'>edge:" + numOfEdge.toString() + "</label>" +
                                    "<label  style='margin: 0.3rem 2rem 0 1rem'>Domain:" + numOfDomain.toString() + "</label>" +
                                    "<button class='btn btn-primary ' style='color: white;margin-right: 15px;border-width: 1px;border-color: #dee2e6' id='clone-btn' data-toggle='modal' data-target='#cloneModal'>Clone to my project</button>" +
                                    "</div>" +
                                    "</div>");

                                $("#label-hint").text("Click one vertex on the graph to see its labels.");
                                $("canvas").on('mousedown', function (e) {
                                    return e.button !== 2;
                                });
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });


                },
                error: function (err) {
                    console.log(err);
                }
            });


        },
        error: function (err) {
            console.log(err);
        }
    });

    $("#clone-submit").on("click",function () {
        $.ajax(
            {
                type: "post",
                url: "share/acceptSharedProject" ,
                headers: {"Authorization": $.cookie('token')},
                dataType: "json",
                data:JSON.stringify(
                    {
                        userId: userId,
                        codeId: codeId
                    }
                ),
                contentType: "application/json",
                success: function (data) {
                    if(data.success.toString()!==true.toString()){
                        alert("Fail to clone this project!");
                    }
                    else{
                        $("#cloneModal").modal('hide');
                        $("#cloneIdentifyModal").modal('show');
                        $("#clone-identify").on("click",function () {
                            $("#cloneIdentifyModal").modal('hide');
                            window.location.href = "/workspace";
                        });

                    }

                },
                error: function (err) {
                    alert("Fail to clone this project!");
                    console.log(err);
                }
            }
        )
    });

});