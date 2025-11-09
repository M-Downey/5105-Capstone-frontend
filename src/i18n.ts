import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app: {
        title: 'RAG Chat',
        chat: 'Chat',
        docs: 'Documents',
        logout: 'Logout',
        language: 'Language',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        username: 'Username',
        password: 'Password',
        isAdmin: 'Administrator (manage documents)',
        loginSuccess: 'Logged in successfully',
        loginFail: 'Login failed',
        registerSuccess: 'Registered, please login',
        registerFail: 'Register failed',
        gotoLogin: 'Go to login',
        gotoRegister: 'Go to register',
        needNamePwd: 'Please enter username and password',
      },
      chat: {
        list: 'Conversations',
        create: 'New',
        none: 'No conversation yet, click New',
        pick: 'Select a conversation',
        placeholder: 'Type a message and press Enter',
        send: 'Send',
        sendFail: 'Send failed',
        start: 'Start chatting ~',
      },
      docs: {
        title: 'Document title',
        selectFile: 'Choose File',
        upload: 'Upload',
        uploading: 'Uploading…',
        list: 'Document List',
        none: 'No data or no permission',
        delete: 'Delete',
        deleteFail: 'Delete failed',
        loadFail: 'Load failed',
        needAdmin: 'Admin permission required',
        needInfo: 'Please enter title and choose a file',
        uploadFail: 'Upload failed',
        uploadSuccess: 'Uploaded successfully',
      },
    },
  },
  zh: {
    translation: {
      app: {
        title: 'RAG Chat',
        chat: '聊天',
        docs: '文档',
        logout: '退出登录',
        language: '语言',
      },
      auth: {
        login: '登录',
        register: '注册',
        username: '用户名',
        password: '密码',
        isAdmin: '管理员（可上传/管理文档）',
        loginSuccess: '登录成功',
        loginFail: '登录失败',
        registerSuccess: '注册成功，请登录',
        registerFail: '注册失败',
        gotoLogin: '去登录',
        gotoRegister: '去注册',
        needNamePwd: '请输入用户名和密码',
      },
      chat: {
        list: '会话',
        create: '新建',
        none: '暂无会话，点击“新建”',
        pick: '请选择会话',
        placeholder: '输入消息，回车发送',
        send: '发送',
        sendFail: '发送失败',
        start: '开始聊天吧～',
      },
      docs: {
        title: '文档标题',
        selectFile: '选择文件',
        upload: '上传',
        uploading: '上传中…',
        list: '文档列表',
        none: '暂无数据或无权限',
        delete: '删除',
        deleteFail: '删除失败',
        loadFail: '加载失败',
        needAdmin: '需要管理员权限',
        needInfo: '请填写标题并选择文件再上传',
        uploadFail: '上传失败',
        uploadSuccess: '上传成功',
      },
    },
  },
}

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n


