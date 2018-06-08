"use strict";

//构造函数，创建数据结构
var CrankCallContract = function() {
    //不良电话数据
    LocalContractStorage.defineMapProperty(this, "crankCall");
    //不良电话总数
    LocalContractStorage.defineProperty(this, "crankCallCount");
    //描述
    LocalContractStorage.defineMapProperty(this, "crankCallContent");
    //不良电话索引
    LocalContractStorage.defineMapProperty(this, "crankCallIndex");
    //不良电话号码
    LocalContractStorage.defineMapProperty(this, "crankCallNumber");
    //附加内容
    LocalContractStorage.defineMapProperty(this, "crankCallAddition");
    LocalContractStorage.defineMapProperty(this, "crankCallAdditionIndex");
};

//原型，存放智能合约方法
CrankCallContract.prototype = {
    init: function() {
        this.crankCallCount = 0;
    },
    /**
     * 分页获取所有不良电话
     * limit:限制每页返回的数量
     * offset:从第几页开始获取
     */
    allCrankCall: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.crankCallCount) {
            throw new Error("offset is not valid");
        }
        if (offset == -1) {
            offset = this.crankCallCount;
        }
        var result = {
            total: this.crankCallCount,
            crankCall: []
        };
        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break;
            }
            var hash = this.crankCallIndex.get(index);
            var crankCall = this.crankCall.get(hash);

            var content = this.crankCallContent.get(hash);
            crankCall.description = content;
            if (crankCall) {
                result.crankCall.push(crankCall);
            }
            if (index == 0) {
                break;
            }
        }
        return result;
    },

    /**
     * 添加不良电话
     * detail:不良电话详情
     */
    addCrankCall: function(detail) {
        var user = Blockchain.transaction.from,
            time = Blockchain.transaction.timestamp,
            txhash = Blockchain.transaction.hash;
        var phoneExp = /(^(\d{3,4}-)?\d{7,8})$|(1[0-9]{10})/;
        if (!detail instanceof Object) {
            throw error("参数有误");
        }
        if (!phoneExp.test(detail.phone)) {
            //电话号码不正确
            throw error("电话号码有误");
        }
        if (detail.description < 5) {
            //请输入5个字以上
            throw error("请输入5个字以上");
        }

        var crankCall = {
            hash: txhash,
            phone: detail.phone,
            description: detail.description,
            created: time,
            author: user,
            type: detail.type,
            index: this.crankCallCount
        };

        //将用户提交的不良电话信息保存到到local contact
        this.crankCall.set(txhash, crankCall);
        //文章内容单独放，保存文章内容到某个交易下，以后通过get(txhash)就可以拿到文章的内容了
        this.crankCallContent.set(txhash, crankCall.description);
        //将索引值与hash对应起来，方便通过索引查找指定的crankCall
        this.crankCallIndex.set(this.crankCallCount, txhash);
        this.crankCallCount += 1;

        //将电话号码作为key存起来，供搜索使用
        this.crankCallNumber.set(detail.phone, txhash);

        var result = {
            hash: txhash
        };
        return result;
    },

    /**
     * 根据phone值获取不良电话详情
     * phone:电话号码
     */
    getInfoByPhone: function(phone) {
        var hash = this.crankCallNumber.get(phone);
        var phoneObj = this.getCrankCallByHash(hash);
        return phoneObj;
    },

    /**
     * 根据哈希值获取不良电话详情
     * hash:电话号码
     */
    getCrankCallByHash: function(hash) {
        // 获取补充内容
        var crankCall = this.crankCall.get(hash);
        var additionNums = crankCall.additionNums * 1;
        if (additionNums) {
            crankCall.addition = []
            for (var i = 0; i < additionNums; i++) {
                var addHash = this.crankCallAdditionIndex.get(hash + "." + i)
                if (addHash) {
                    var addContent = this.crankCallAddition.get(addHash)
                    crankCall.addition.push(addContent)
                }
            }
        }
        var content = this.crankCallContent.get(hash);
        crankCall.description = content;
        return crankCall;
    },
    //添加补充内容
    addAddition: function(detail) {
        var ts = Blockchain.transaction.timestamp,
            fromUser = Blockchain.transaction.from,
            txhash = Blockchain.transaction.hash;

        var hash = detail.hash;
        if (!hash) {
            throw new Error("缺少hash值");
        }
        var content = detail.content;
        if (!content) {
            throw new Error("补充内容不能为空");
        }
        //通过哈希值拿到当前文章的基本信息
        var crankCall = this.crankCall.get(detail.hash);
        if (!crankCall) {
            throw new Error("数据不存在");
        }

        if (!crankCall.additionNums) {
            crankCall.additionNums = 0;
        }
        var additionNums = crankCall.additionNums * 1;

        this.crankCallAdditionIndex.set(hash + "." + additionNums, txhash);
        this.crankCallAddition.set(txhash, {
            content: content,
            created: ts,
            hash: txhash
        });

        crankCall.additionNums += 1;
        //更新当前数据
        this.crankCall.set(hash, crankCall);
    }
};

module.exports = CrankCallContract;
