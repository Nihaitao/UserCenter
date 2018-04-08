﻿require_js_file(["table", "form", "jquery", "tableExt"],
    function (fnr) {
        var $ = layui.$;
        window.rootApp = new Vue({
            el: "#root",
            data: {
                submitForm: {
                    Phone: "",
                    PhoneCode: "",
                    Stationproxy_ID: 0
                },
                status: {
                    disabled: false,
                    tipText: '发送'
                }
            },
            ready: function () {
                //显示页面标题
                $.get("/service/edu/BaseSet/GetStationInfo", {}, function (resp) {
                    if (resp.SuccessResponse)
                        document.title = resp.Data.Name + "_登录";
                }, "json");
            },
            methods: {
                setCodeTime: function (Seconds, e) {
                    var self = this;
                    if (Seconds > 0) {
                        self.status.disabled = true;
                        self.status.tipText = Seconds + "秒";
                        var timer = setInterval(function () {
                            Seconds = Seconds - 1;
                            if (Seconds > 0)
                                self.status.tipText = Seconds + "秒";
                            else {
                                clearInterval(timer);
                                self.status.tipText = "发送";
                                self.status.disabled = false;
                            }
                        }, 1000);
                    } else
                        self.status.disabled = false;
                    return false;
                },
                SendPhoneCode: function (e) {

                    if (!layui.form.checkInput(e, "phone")) {
                        return false;
                    }
                    var self = this;
                    if (self.status.disabled) {
                        return;
                    }
                    self.status.disabled = true;
                    $.post("/service/hr/Station/SendPhoneCode", this.submitForm, function (rsp) {
                        if (rsp.SuccessResponse) {
                            window.rootApp.submitForm.PhoneCode = rsp.Data.Num;
                            self.setCodeTime(rsp.Data.Seconds, e)
                            layer.msg(rsp.Message, { icon: 1 });
                        }
                        else {
                            layer.msg(rsp.Message, { icon: 2 });
                            if (rsp.Data != null) {
                                self.setCodeTime(rsp.Data.Seconds, e)
                            } else {
                                self.status.disabled = false;
                            }
                        }
                    })
                    return false;
                },
                saveUpdate: function (e) {
                    if (!layui.form.checkInput(e)) {
                        return false;
                    }
                    $.post("/service/hr/Station/Login", this.submitForm, function (rsp) {
                        if (rsp.SuccessResponse) {

                            fnr.Cookie.set("AccountID", rsp.Data.Account_ID);
                            fnr.Cookie.set("AccountName", rsp.Data.Name);

                            //写入cookie ID
                            location.href = "/Html/Index.html";
                        }
                        else
                            layer.msg(rsp.Message, { icon: 2 });
                    })
                    return false;
                }
            }
        });
    });