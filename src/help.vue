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
                </el-menu>
            </el-header>
            <el-main>
                <el-card class="box-card">
                    <h1>不良电话曝光台使用教程</h1>
                    <h2>1.安装星云钱包</h2>
                    <p>本站基于星云链实现，想要所有的功能则需安装星云钱包Chrome扩展插件，下载及安装教程：<a rel="nofollow" target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">https://github.com/ChengOrangeJu/WebExtensionWallet</a></p>
                    <h2>2.发布内容</h2>
                    <p>完成了星云钱包的安装，就可以浏览和发布内容了。</p>
                    <p>1).点右上角的“添加”按钮</p>
                    <p>2).在弹窗填写内容</p>
                    <p>3).点击确定后唤起星云钱包，发起交易，等交易成功后即可查看刚刚发布的内容了。</p>
                    <h2>3.补充内容</h2>
                    <p>补充内容与发布内容类似，这里不再赘述.</p>
                    <br>
                    <br>
                    <p>如有疑问，请于管理员联系 tammeny@qq.com</p>
                </el-card>
            </el-main>
            <cc-footer />
        </el-container>
    </div>
</template>

<script>
import ccFooter from './components/footer.vue';
export default {
    data() {
        return {
        };
    },
    components: {ccFooter},
    created: function() {
    },
    methods: {
    }
};
</script>

<style>
.el-main{
    background-color: #f6f6f6;
}
h1{
    text-align: center;
}
h2{
    font-size: 18px;
}
.el-card {
    margin-bottom: 20px;
}
.el-menu--horizontal>.el-menu-item a{
    text-decoration: none;
}
</style>
