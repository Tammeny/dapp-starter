<template>
    <el-footer>
        <div class="statement">
            <p>基于星云链实现，所有提交的内容都储存在区块链上，<router-link :to="{path:'/help'}">使用教程</router-link></p>
            <p>本网站只是提供交流平台，对是否骗子/骚扰电话不下结论，如有疑问请与管理员联系 tammeny@qq.com</p>
        </div>
    </el-footer>
</template>

<script>
export default {
        name: "footer",
}
</script>

<style>
.statement{
    font-size: 12px;
    color: rgb(177, 175, 175);
    text-align: center;
}
</style>
