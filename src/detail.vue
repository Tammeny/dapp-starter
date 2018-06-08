<template>
    <div>
        <el-container>
            <el-header>
                <el-menu class="el-menu-demo" mode="horizontal">
                    <el-menu-item index="1">
                        <router-link class="name" :to="{path:'/'}">
                            <i class="el-icon-arrow-left"></i>返回首页
                        </router-link>
                    </el-menu-item>
                    <el-menu-item index="3" class="add-button">
                        <el-button type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">添加补充</el-button>
                    </el-menu-item>
                </el-menu>
            </el-header>
            <el-main v-loading="loading" element-loading-text="拼命加载中...">
                <el-card class="box-card">
                    <el-row>
                        <el-col :xs="4" :sm="4" :md="4" :xl="4">电话：</el-col>
                        <el-col :xs="20" :sm="20" :md="20" :xl="20"><strong>{{crankCall.phone}}</strong></el-col>
                    </el-row><br>
                    <el-row>
                        <el-col :xs="4" :sm="4" :md="4" :xl="4">类型：</el-col>
                        <el-col :xs="20" :sm="20" :md="20" :xl="20"><el-tag type="danger">{{crankCall.type}}</el-tag></el-col>
                    </el-row><br>
                    <el-row>
                        <el-col :xs="4" :sm="4" :md="4" :xl="4">描述：</el-col>
                        <el-col :xs="20" :sm="20" :md="20" :xl="20">{{crankCall.description}}</el-col>
                    </el-row>
                </el-card>
                <el-tabs type="border-card">
                <el-tab-pane label="来自其他网友补充的内容">
                    <el-row v-for="(item, index) in crankCall.addition" :key="index">
                        <el-col :xs="24" :sm="24" :md="24" :xl="24">{{index+1}}. {{item.content}}</el-col>
                    </el-row>
                </el-tab-pane>
                </el-tabs>
                
            </el-main>
            <cc-footer />
        </el-container>
        <el-dialog title="补充内容" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="crankCall">
                <el-form-item label="描述" :label-width="formLabelWidth">
                    <el-input type="textarea" :rows="4" v-model="crankCall.content" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addAddition(crankCall)">确 定</el-button>
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
            crankCall: {},
            loading: true,
            noWallet: false,
            currentWallectAddress: "",
            formLabelWidth: "100px",
        };
    },
    components: {ccFooter},
    created: function() {
        this.getWallectInfo();
        var hash = this.$route.params.hash;
        hash && this.getCrankCallDetail(hash);
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
        //获取详情
        getCrankCallDetail: function(hash) {
            var _this = this;
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
                            function: "getCrankCallByHash",
                            args: JSON.stringify([hash])
                        }
                    })
                    .then(function(res) {
                        console.info(res);
                        if (!res) {
                            return;
                        }
                        var result = JSON.parse(res.result);
                        if (result) {
                            _this.crankCall = result;
                        } else {
                        }
                        _this.loading = false;
                    });
            });
        },
        //补充内容
        addAddition: function(detail){
            var _this = this;
            var data = [{
                hash: detail.hash,
                content: detail.content,
            }];
            console.info("准备要提交的数据是:", data);
            var serialNumber = nebPay.call(
                config.contractAddress,
                0,
                "addAddition",
                //"[\"{phone:'13691127253',description:'传销，诈骗，不良信息',type:'诈骗'}\"]",
                JSON.stringify(data),
                {
                    callback: config.payApi,
                    listener: function(value) {
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
                            //获取附加内容列表
                            location.reload();
                        }
                    });
            }, 6000);
        }
    }
};
</script>

<style>
.el-main{
    background-color: #f6f6f6;
}
.el-card {
    margin-bottom: 20px;
}
.el-menu--horizontal>.el-menu-item a{
    text-decoration: none;
}
.el-menu--horizontal > .el-menu-item.add-button {
    float: right;
    padding-right: 0;
}
</style>
