﻿var moduleid = [];
var IsSubSystem = 0;
var pid = 0;
require_js_file(['table', 'form', 'jquery', 'tableExt', 'element', "linq"],
    function (fnr) {
        var $ = layui.jquery
            , element = layui.element;
        var layer = layui.layer;
        var linq = layui.linq;
        var MenuList;

        var goto = fnr.getQueryString("goto");
        var goto1, goto2;
        if (goto != undefined) {
            goto1 = goto.split("_")[0]
            goto2 = goto.split("_")[1]
        }
        $("#AccountStr span").html(unescape(fnr.Cookie.get("AccountName")));


        //初始化权限菜单
        $.get("/service/hr/StationAccount/GetModuleMenusByAccountID", {}, function (rsp) {
            console.log(rsp);
            if (rsp.SuccessResponse) {
                MenuList = rsp.Data;
                MenuList.H_Modules = linq.from(MenuList.H_Modules).where(x => x.IsSubSystem == IsSubSystem).toArray();
                var indexNo = 0;
                $.each(MenuList.H_Modules, function (i, x) {
                    if (moduleid == null && x.PID == 0) {
                        if (indexNo == 0)
                            iterateMenuTree(x.ID);
                        $("#TopMenu").append("<li data-id=\"" + x.ID + "\" class=\"layui-nav-item " + (indexNo == 0 ? "layui-this" : "") + "\"><a href=\"javascript:;\">" + x.Name + "</a></li>");
                        indexNo++;
                    } else if (moduleid != null && moduleid.concat(x.ID) && x.PID == pid) {
                        if (indexNo == 0)
                            iterateMenuTree(x.ID);
                        $("#TopMenu").append("<li data-id=\"" + x.ID + "\" class=\"layui-nav-item " + (indexNo == 0 ? "layui-this" : "") + "\"><a href=\"javascript:;\">" + x.Name + "</a></li>");
                        indexNo++;
                    }
                });
                
                $("#TopMenu").find("li").click(function () {
                    if ($(this).attr("class").indexOf("layui-this") == -1) {
                        iterateMenuTree($(this).attr("data-id"));
                        $(this).addClass("layui-this").siblings().removeClass("layui-this");
                        element.init();
                    }
                });



                var goto = fnr.getQueryString("goto");
                var goto1, goto2;
                if (goto != undefined) {
                    goto1 = goto.split("_")[0]
                    goto2 = goto.split("_")[1]
                }

                $("#TopMenu").find("li[data-id=" + goto1 + "]").click();
                setTimeout(function () {

                    $("#LeftMenu dd[data-id=" + goto2 + "]").parents(".layui-nav-item").addClass("layui-nav-itemed");
                    $("#LeftMenu dd[data-id=" + goto2 + "]").click()
                    $("iframe[name=MainRight]").attr("src", $("#LeftMenu dd[data-id=" + goto2 + "] a").attr("href"));

                },200);
            } else {
                //location.href = "/Login.html";
            }
            element.init();

        });
        function iterateMenuTree(ID) {
            $("#LeftMenu").html("");
            var tmpStr = '';
            var indexNo = 0;
            $.each(MenuList.H_Modules, function (i, x) {
                if (x.PID == ID) {
                    tmpStr += "<li data-id=\"" + x.ID + "\" class=\"layui-nav-item " + (indexNo == 0 ? "layui-nav-itemed" : "") + "\"><a href=\"javascript:;\" style=\"padding-left:10px\"><i class=\"layui-icon\" style=\"font-size: 16px; padding-right:5px\">&#xe6b2;</i>&nbsp;" + x.Name + "</a>";
                    if (MenuList.H_Menus.length > 0) {
                        tmpStr += "<dl class=\"layui-nav-child\">";
                        $.each(MenuList.H_Menus, function (ii, xx) {
                            if (xx.Module_ID == x.ID) {
                                tmpStr += "<dd data-id=\"" + xx.ID + "\" data-cid=\"" + x.ID + "\" data-pid=\"" + ID + "\"><a href=\"" + xx.Path + "\" target=\"MainRight\">" + xx.Name + "</a></dd>";
                            }
                        });
                        tmpStr += "</ul>";
                    }
                    tmpStr += "</li>";
                    indexNo++;
                }
            });
            $("#LeftMenu").html(tmpStr);
            $("#LeftMenu dd").click(function () {
                $(".layui-tab-title .layui-this").html($(this).find("a").text()).attr("data-id", $(this).attr("data-id")).attr("data-cid", $(this).attr("data-cid")).attr("data-pid", $(this).attr("data-pid"));
                element.init();
            });
        }

        //初始化窗口高度
        var iframHeight = window.innerHeight - 100;
        $("iframe").height(iframHeight);
        $(".layui-tab-content").height(iframHeight);
        $(".layui-tab-title").width(window.innerWidth - 150 - 140)
        $(".layui-tab-title").bind("contextmenu", function (e) {
            if (e.target.localName == "ul") {
                var _id = new Date().getTime();
                element.tabAdd('tab', {
                    title: '新选项卡'
                    , content: '<iframe src="" name="MainRight" style="height:' + iframHeight + 'px"></iframe>'
                    , id: _id
                });
                element.tabChange('tab', _id);
            }
            return false;
        })
        $(window).resize(function () {
            var iframHeight = window.innerHeight - 100;
            $("iframe").height(iframHeight);
            $("div.layui-tab-content").height(iframHeight);
        });

        //增加选项卡
        //$('#addTab').on('click', function () {
        //    var _id = new Date().getTime();
        //    element.tabAdd('tab', {
        //        title: '新选项卡'
        //        , content: '<iframe src="" name="MainRight" style="height:' + iframHeight + 'px"></iframe>'
        //        , id: _id
        //    });
        //    element.tabChange('tab', _id);
        //});

        //刷新当前页
        $('.refresh').on('click', function () {
            if (!$(this).hasClass("refreshThis")) {
                $(".layui-show iframe")[0].contentWindow.location.reload(true);
                $(".refresh").addClass("refreshThis");
                setTimeout(function () {
                    $('.refresh').removeClass("refreshThis");
                }, 2000)
            } else {
                layer.msg("您点击的速度超过了服务器的响应速度，还是等两秒再刷新吧！");
            }
        });
        //关闭其他
        $('.closePageOther').on('click', function () {
            $(".layui-tab-title li[lay-id]").each(function () {
                if (!$(this).hasClass("layui-this")) {
                    element.tabDelete("tab", $(this).attr("lay-id"));
                }
            })
        });
        //关闭所有
        $('.closePageAll').on('click', function () {
            $(".layui-tab-title li[lay-id]").each(function () {
                element.tabDelete("tab", $(this).attr("lay-id"));
            })
        });

        //选项卡切换事件
        var oldindex = 0;
        element.on('tab(tab)', function (i) {
            if (oldindex != i.index) {
                $(".layui-tab-item iframe").removeAttr("name");
                $(".layui-tab-item iframe").each(function () {
                    this.contentWindow.window.name = "";
                });
                var indexno = oldindex = i.index;
                $(".layui-tab-item:eq(" + indexno + ")").find("iframe").attr("name", "MainRight");
                $(".layui-tab-item:eq(" + indexno + ")").find("iframe")[0].contentWindow.window.name = "MainRight";

                var id = $(this).attr("data-id"), cid = $(this).attr("data-cid"), pid = $(this).attr("data-pid");
                if (id != undefined && cid != undefined && pid != undefined) {
                    $("#TopMenu li").removeClass("layui-this").each(function () {
                        if ($(this).attr("data-id") == pid) {
                            $(this).addClass("layui-this");
                            iterateMenuTree(pid)

                            $("#LeftMenu li").removeClass("layui-nav-itemed").each(function () {
                                if ($(this).attr("data-id") == cid) {
                                    $(this).addClass("layui-nav-itemed");

                                    $(this).find("dd").each(function () {
                                        if ($(this).attr("data-id") == id) {
                                            $(this).addClass("layui-this");
                                        }
                                    });
                                }
                            });
                            element.init();
                        }
                    });
                }
            }
        });

        function GetCookieValue(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        try{
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        }catch(e){}
                        break;
                    }
                }
            }
            return cookieValue;
        }
        function DelCookie(name) {
            var exp = new Date();
            exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
            var cval = GetCookieValue(name);
            document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
        }
        $("#LoginOut").click(function (e) {
            //调用退出控制器
            layer.confirm("确定退出么", function () {
                DelCookie('AccountID')
                DelCookie('AccountName')
                location.href = $(e.target).data("url");
            });
        });

    });