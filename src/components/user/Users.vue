<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card class="box-card">
      <div style="margin-top: 15px;">
        <!--搜索框区域-->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query"  clearable  @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
        <!--用户列表区域-->
        <el-table :data="userList" style="width: 100%" border stripe>
          <el-table-column type="index" label="编号"></el-table-column><!--第一列编号-->
          <el-table-column prop="username" label="姓名" ></el-table-column>
          <el-table-column prop="email" label="邮箱" ></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <template slot-scope="scope">
              <!--{{scope.row}}显示此列所有数据-->
              <el-switch v-model="scope.row.mg_state" active-color="#13ce66" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170px">
            <template slot-scope="scope">
              <!--修改-->
              <el-tooltip  effect="dark" content="编辑" placement="top">
                <el-button type="primary" icon="el-icon-edit" circle size="small" @click="editDialog(scope.row.id)"></el-button>
              </el-tooltip>
              <!--删除-->
              <el-tooltip effect="dark" content="删除" placement="top">
                <el-button type="danger" icon="el-icon-delete" circle size="small" @click="removeUserByID(scope.row.id)"></el-button>
              </el-tooltip>
              <!--分配-->
              <el-tooltip  effect="dark" content="分配" placement="top">
                <el-button type="success" icon="el-icon-setting" circle size="small"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    <!--添加用户-->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="45%" @close="addDialogClosed">
      <!--对话框主体区域-->
      <el-form :model="addForm" status-icon :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input  v-model="addForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" >
          <el-input  v-model="addForm.password" autocomplete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input  v-model="addForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input  v-model="addForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <!--对话框底部-->
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
              </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="45%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px" >
        <el-form-item label="用户名" >
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    //  自定义验证手机号规则
    var checkEmail = (rule, value, callback) => {
      //  验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前规格
        pagesize: 5
      },
      userList: [],
      total: 0,
      //  控制对话框显示、隐藏
      dialogVisible: false,
      //  添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //  添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6~15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { min: 11, max: 11, message: '长度在11个字符', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      //  点击修改查询到的用户信息
      editForm: {}
      // editFormRules: {
      //   email: [
      //     { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      //     { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      //   ],
      //   mobile: [
      //     { required: true, message: '请输入手机号码', trigger: 'blur' },
      //     { min: 11, max: 11, message: '长度在11个字符', trigger: 'blur' },
      //     { validator: checkEmail, trigger: 'blur' }
      //   ]
      // }
    }
  },
  created () {
    this.getUserList()
  },
  // 生命周期函数
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    //  监听pagesize改变的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //  箭筒switch状态开关的改变
    async userStateChange (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('切换状态失败！')
      }
      this.$message.success('切换状态成功！')
    },
    //  监听对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    //  点击确定按钮，添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        //  valid返回的状态值 false|true 校验是否添加内容
        // console.log(valid)
        if (!valid) return
        //  发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) this.$message.error('添加失败')
        this.$message.success('添加成功')
        //  关闭对话框
        this.dialogVisible = false
        //  刷新列表
        this.getUserList()
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    //  打开编辑用户的对话框
    async editDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id) //  解构data属性，重命名为res
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击确定，预验证
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        //  发起修改用户信息的请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) this.$message.error('编辑用户信息失败！')
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('编辑用户信息成功！')
      })
    },
    //  根据id删除用户信息
    async removeUserByID (id) {
      //  弹窗询问用户是否删除数据
      //  console.log(id)
      const resInfo = await this.$confirm('此操作将永久删除该用户信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      //  如果用户确认删除 则返回值为字符串 confirm,取消删除 返回cancel
      // console.log(res)
      if (resInfo !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      //  确认删除
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功！')
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped >

</style>
