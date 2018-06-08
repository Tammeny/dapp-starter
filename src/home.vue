<template>
    <div class="home">
        <el-container>
            <el-header>
                <el-menu class="el-menu-demo" mode="horizontal">
                    <el-menu-item index="1" @click="reset">
                        <img src="./assets/logo.png" alt="不良电话曝光台" class="logo">
                        <strong>不良电话曝光台</strong>
                    </el-menu-item>
                    <el-menu-item index="2" hidden-md-and-down>
                        <el-input placeholder="请输入手机号码" v-model="phone">
                            <el-button :loading="loading" slot="append" icon="el-icon-search" @click="getCrankCall(phone)"></el-button>
                        </el-input>
                        <el-button @click="reset">
                            重置
                        </el-button>
                    </el-menu-item>
                    <el-menu-item index="3" class="add-button" hidden-md-and-down>
                        <el-button type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">添加</el-button>
                    </el-menu-item>
                </el-menu>
            </el-header>
            <el-main v-loading="loading" element-loading-text="拼命加载中...">
                <el-alert type="error" show-icon="true" v-if="noWallet">
                    安装<a target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">星云钱包</a>使用所有功能.
                </el-alert>
                <el-row :gutter="10">
                    <el-col :xs="24" :sm="12" :md="6" :xl="4" v-for="(item, index) in crankCallList" :key="index">
                        <router-link class="name" :to="{path:'/detail/'+item.hash}" style="text-decoration:none;">
                        <div class="grid-content bg-purple">
                            <el-card shadow="always">
                                <el-row>
                                    <el-col :xs="12" :sm="12" :md="12" :xl="12"><strong>{{item.phone}}</strong></el-col>
                                    <el-col :xs="12" :sm="12" :md="12" :xl="12" style="text-align:right"><el-tag type="danger">{{item.type}}</el-tag></el-col>
                                </el-row>
                                <el-row>
                                    <p class="description">{{item.description}}</p>
                                </el-row>
                            </el-card>
                        </div>
                        </router-link>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :xl="24" style="text-align:center;">
                        <el-button type="primary" v-if="pagination.show" :loading="pagination.loading" @click="loadMore">{{pagination.text}}</el-button>
                    </el-col>
                </el-row>
            </el-main>
            <cc-footer />
        </el-container>
        <el-dialog title="曝光电话" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="号码" :label-width="formLabelWidth">
                    <el-input v-model="form.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="类型" :label-width="formLabelWidth">
                    <el-radio-group v-model="form.type">
                        <el-radio :label="item" v-for="(item, index) in form.types" :key="index"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="描述" :label-width="formLabelWidth">
                    <el-input type="textarea" :rows="4" v-model="form.description" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCrankCall(form)">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import ccFooter from './components/footer.vue';
export default {
    data() {
        return {
            dialogFormVisible: false,
            form: {
                phone: "",
                types: ["骚扰", "诈骗", "推销", "其他"],
                type: "",
                description: ""
            },
            loading: true,
            noWallet: false,
            crankCallList: [],
            currentWallectAddress: "",
            formLabelWidth: "100px",
            pagination: {
                show: false,
                loading: false,
                limit: 16,
                offset: -1,
                text: "加载更多"
            }
        };
    },
    components: { ccFooter },
    mounted: function() {
    },
    created: function() {
        this.getWallectInfo();
        this.fetchallCrankCall(this.pagination.limit, this.pagination.offset);
        if (typeof webExtensionWallet === "undefined") {
            this.noWallet = true;
            this.loading = false;
        }
    },
    methods: {
        //获取当前钱包信息
        getWallectInfo: function() {
            var _this = this;
            window.addEventListener("message", function(e) {
                if (e.data && e.data.data) {
                    if (e.data.data.account) {
                        _this.currentWallectAddress = e.data.data.account;
                    }
                }
            });

            window.postMessage(
                {
                    target: "contentscript",
                    data: {},
                    method: "getAccount"
                },
                "*"
            );
        },
        //获取电话列表
        fetchallCrankCall: function(limit, offset) {
            var _this = this;
            console.info(limit, offset)
            nebApi.getNebState().then(function(state) {
                nebApi
                    .call({
                        chainID: state.chain_id,
                        from: _this.currentWallectAddress,
                        to: config.contractAddress,
                        value: 0,
                        // nonce: nonce,
                        gasPrice: 1000000,
                        gasLimit: 2000000,
                        contract: {
                            function: "allCrankCall",
                            args: JSON.stringify([limit, offset])
                        }
                    })
                    .then(function(res) {
                        console.info(res)
                        if (!res) {
                            return;
                        }
                        var result = JSON.parse(res.result);
                        if (result) {
                            _this.crankCallList = _this.crankCallList.concat(result.crankCall);
                            _this.loading = false;

                            //判断有无下一页
                            if(_this.crankCallList.length<result.total){
                                _this.pagination.show = true;
                                _this.pagination.loading = false;
                            }else{
                                _this.pagination.show = false;
                            }
                        }
                    });
            });
        },
        //添加电话
        addCrankCall: function(form) {
            var _this = this;
            var data = [
                {
                    phone: form.phone,
                    description: form.description,
                    type: form.type
                }
            ];
            console.info("准备要提交的数据是:", data);
            var serialNumber = nebPay.call(
                config.contractAddress,
                0,
                "addCrankCall",
                //"[\"{phone:'13691127253',description:'传销，诈骗，不良信息',type:'诈骗'}\"]",
                JSON.stringify(data),
                {
                    callback: config.payApi,
                    listener: function(value) {
                        console.info("正在获取", value);
                        if(!value.txhash){
                            _this.$message({
                                showClose: true,
                                message: "已取消发布！",
                                type: "warning"
                            });
                            return;
                        }
                        var notify = _this.$notify({
                            title: "正在提交数据",
                            message:
                                "如果你不想等待结果，稍后刷新页面即可查看。",
                            duration: 0,
                            type: "warning"
                        });
                        _this.dialogFormVisible = false;
                        _this.checkTransaction(value.txhash, notify);
                    }
                }
            );
        },
        //搜索电话
        getCrankCall: function(phone) {
            var _this = this;
            var phoneExp = /(^(\d{3,4}-)?\d{7,8})$|(1[0-9]{10})/;
            if (!phoneExp.test(phone)) {
                _this.$message({
                    showClose: true,
                    message: "请输入正确的电话号码",
                    type: "warning"
                });
                return;
            }
            _this.loading = true;
            nebApi.getNebState().then(function(state) {
                nebApi
                    .call({
                        chainID: state.chain_id,
                        from: _this.currentWallectAddress,
                        to: config.contractAddress,
                        value: 0,
                        // nonce: nonce,
                        gasPrice: 1000000,
                        gasLimit: 2000000,
                        contract: {
                            function: "getInfoByPhone",
                            args: JSON.stringify([phone])
                        }
                    })
                    .then(function(res) {
                        if (!res) {
                            return;
                        }
                        var result = JSON.parse(res.result);
                        if (result) {
                            _this.crankCallList = [result];
                        } else {
                            _this.crankCallList = [];
                            _this.$message({
                                showClose: true,
                                message: "此号码暂无投诉",
                                type: "warning"
                            });
                        }
                        _this.loading = false;
                    });
            });
        },
        loadMore: function() {
            var _this = this;
            _this.pagination.loading = true;
            _this.pagination.offset ++
            _this.fetchallCrankCall(_this.pagination.limit, _this.pagination.offset);
        },
        //查询交易状态
        checkTransaction: function(hash, notify) {
            var _this = this;
            var timer = setInterval(function() {
                nebApi
                    .getTransactionReceipt({
                        hash: hash
                    })
                    .then(function(receipt) {
                        if (receipt.status === 1) {
                            clearInterval(timer);
                            notify.close();
                            _this.$notify({
                                title: "操作成功",
                                type: "success"
                            });
                            location.reload();
                        }
                    });
            }, 6000);
        },
        reset: function(){
            location.reload();
        }
    }
};
</script>

<style>
html,body,.home,.el-container{
    min-height: 100vh;
    padding: 0;
    margin: 0;
}
.logo{
    width: 40px;
}
.el-main{
    background-color: #f6f6f6;
}
.el-card,
.el-alert {
    margin-bottom: 10px;
}
.el-menu-item .el-button--primary i {
    color: #fff;
}
.el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: none;
}
.el-menu--horizontal > .el-menu-item.add-button {
    float: right;
    padding-right: 0;
}
.description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
}
.statement{
    font-size: 12px;
    color: rgb(177, 175, 175);
    text-align: center;
}
@media only screen and (max-width:767px){
    [hidden-md-and-down]{
        display: none!important;
    }
}
</style>
