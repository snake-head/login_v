<template>
  <div class="hello">
    <div>登录测试</div>
    <br>
    <div class="msg-line">
      <div class="msg-line-center">
        {{msg}}
      </div>
    </div>
    <div class="msg-line">
      <div class="rec-line-center">
        记录:
      </div>
    </div>
    <div class="msg-line">
      <div class="rec-line-center token">
        令牌: <input class="tk-input" id="token" type="text" v-model="rec.token" />
      </div>
    </div>
    <div class="msg-line">
      <div class="rec-line-center">
        时间戳: <input class="tk-input" id="ts" type="text" v-model="rec.ts" />
      </div>
    </div>
    <div class="msg-line">
      <div class="rec-line-center">
        nonce: <input class="tk-input" id="nonce" type="text" v-model="rec.nonce" />
      </div>
    </div>
    <div class="msg-line">
      <div class="rec-line-center">
        sign(根据 令牌+时间戳+nonce 自动生成): <input class="tk-input" id="sign" type="text" v-model="rec.sign" />
        <button :class="`btn-sign ${rec.signLock?'locked':''}`" @click="rec.signLock = !rec.signLock">{{rec.signLock?'locked':'unlock'}}</button>
      </div>
    </div>
    <br>
    <div class="form">
      <div class="form-line">
        <label class="form-label" for="userName">
          用户名：
        </label>
        <input class="form-input" id="userName" type="text" v-model="loginMsg.userName" />
      </div>
      <div class="form-line">
        <label class="form-label" for="passWord">
          密码：
        </label>
        <input class="form-input" id="passWord" type="password" v-model="loginMsg.passWord" />
      </div>
    </div>
    <br>
    <button class="btn" @click="login">登录</button>
    <button class="btn" @click="logout">注销</button>
    <button class="btn" @click="downLoadTest">读取模型测试</button>
    <br>
    <button class="btn" @click="getTokenTest">获得令牌测试</button>
    <button class="btn" @click="downloadTestWithRecToken">令牌读取模型</button>
    <br>
    <button class="btn" @click="downloadTestWithToken">获取新令牌+读取模型</button>
    <button class="btn" @click="downloadTestWithRecord">重放读取模型</button>
    <button class="btn" @click="dispatchToSite">直接跳转</button>
    <button class="btn" @click="dispatchToSiteWithToken">动态令牌跳转</button>
    <button class="btn" @click="dispatchToSiteWithStaticToken">静态令牌跳转</button>
  </div>
<!--  <div>-->
<!--    <button class="btn" @click="loginToDjango">登录</button>-->
<!--    <button class="btn" @click="logoutToDjango">注销</button>-->
<!--    <button class="btn" @click="checkLoginToDjango">检查登录状态</button>-->
<!--    <button class="btn" @click="getTokenAndJump">得到token并跳转</button>-->
<!--    <button class="btn" @click="getResourceByRouteToken">使用token获取资源</button>-->
<!--    <button class="btn" @click="getResource">一般获取资源</button>-->
<!--    <button class="btn" @click="getResourceByRecord">重放获取资源</button>-->
<!--  </div>-->
</template>

<script>
  import {ref, reactive, onMounted} from 'vue'
  import axios from 'axios'
  import CryptoJS from 'crypto-js'
  import { useRoute } from 'vue-router'

export default {
  name: 'HelloWorld',
  setup() {
    let msg = ref('-------')
    let loginMsg = reactive({
      userName: '',
      passWord: '',
    })
    function login() {
      axios.post(window.linkConfig.login, {
        userId: loginMsg.userName,
        password: loginMsg.passWord,
        verificationCode: 'verificationCode123456',
      }).then(res=>{
        msg.value = res.data.data
      })
    }
    function logout() {
      axios.get(window.linkConfig.logout).then(res=>{
        msg.value = res.data
      })
    }
    function downLoadTest() {
      axios.get(window.linkConfig.downloadTest).then(res=>{
        msg.value = res.data
      })
    }
    function dispatchToSite() {
      window.location.href = window.linkConfig.teethSite
      msg.value = window.linkConfig.teethSite
    }
    function getTokenTest() {
      axios.get(window.linkConfig.getTokenApi).then(resp=>{
        msg.value = resp.data
        rec.token = resp.data.access_token
      })
    }
    function dispatchToSiteWithToken() {
      if (rec.token !== '') {
        window.location.href = window.linkConfig.teethSite + `&token=${rec.token}`
      } else {
        axios.get(window.linkConfig.getTokenApi).then(resp=>{
          msg.value = resp.data
          const token = resp.data.access_token
          window.location.href = window.linkConfig.teethSite + `&token=${token}`
        })
      }
    }
    function downloadTestWithRecToken() {
      let token = rec.token
      let ts = Math.round(new Date().getTime() / 1000) // 秒级时间戳(整数)
      let nonce = CryptoJS.MD5((ts + Math.floor(Math.random()*1000)).toString()).toString()
      let sign = rec.sign
      if (!rec.signLock) {
        const signstr = `token:${token}&timestamp:${ts}&nonce:${nonce}`
        sign = CryptoJS.MD5(signstr).toString()
      }
      axios.get(window.linkConfig.downloadTest, {
        headers: {
          authorization: token,
          ts,
          nonce,
          sign,
        }}).then(resp=>{
        msg.value = resp.data
        rec.nonce = nonce
        rec.ts = ts
        rec.sign = sign
      })
    }
    function downloadTestWithToken() {
      axios.get(window.linkConfig.getTokenApi).then(resp=>{
        msg.value = resp.data
        const token = resp.data.access_token
        const ts = Math.round(new Date().getTime() / 1000)  // 秒级时间戳
        const nonce = CryptoJS.MD5((ts + Math.floor(Math.random()*1000)).toString()).toString()
        const signstr = `token:${token}&timestamp:${ts}&nonce:${nonce}`
        const sign = CryptoJS.MD5(signstr).toString()
        console.log(window.linkConfig.downloadTest)
        axios.get(window.linkConfig.downloadTest, {
          headers: {
            authorization: token,
            ts,
            nonce,
            sign,
          }}).then(resp=>{
            msg.value = resp.data
            rec.token = token
            rec.nonce = nonce
            rec.ts = ts
            rec.sign = sign
        })
      })
    }

    function downloadTestWithRecord() {
      const {token, ts, nonce, sign} = rec
      if (token === '' || ts === '' || nonce === '') {
        msg.value = '先使用一次[令牌读取模型]/[获取新令牌+读取模型]吧!'
      }
      // const signstr = `token:##${token}##-&-timestamp:##${ts}##-&-nonce:##${nonce}##`
      // const sign = CryptoJS.MD5(signstr).toString()
      axios.get(window.linkConfig.downloadTest, {
        headers: {
          authorization: token,
          ts,
          nonce,
          sign,
        }}).then(resp=>{
          msg.value = resp.data
      })
    }

    function dispatchToSiteWithStaticToken() {
      window.location.href = window.linkConfig.teethSite + `&token=49b9027d7704a736a770c3a0dfb45010488883b8&user=digi-ortho`
    }

    let rec = reactive({
      token: '',
      ts: '',
      nonce: '',
      sign: '',
      signLock: false,
    })

    onMounted(() => {
      const route = useRoute()
      record.route = route
      record.token = route.query.token
    })

    let record = {
      token: '',
      ts: 0,
      nonce: '',
    }
    //
    // function loginToDjango() {
    //   const url = '/oauth2.0/login/'
    //   axios.defaults.withCredentials=true
    //   axios.get(url).then(resp=>{
    //     console.log(resp.data)
    //   })
    // }
    // function logoutToDjango() {
    //   const url = '/oauth2.0/logout/'
    //   axios.get(url).then(resp=>{
    //     console.log(resp.data)
    //   })
    // }
    // function checkLoginToDjango() {
    //   const url = '/oauth2.0/check_login/'
    //   axios.get(url).then(resp=>{
    //     console.log(resp.data)
    //   })
    // }
    // function getTokenAndJump() {
    //   const url = '/oauth2.0/token/'
    //   axios.get(url).then(resp=>{
    //     const token = resp.data.access_token
    //     window.location.href = `http://172.16.112.101:5000/testLogin/#/testLogin?token=${token}`
    //   })
    // }
    // function getResource() {
    //   const url = '/oauth2.0/resource/'
    //   axios.get(url).then(resp=>{
    //     console.log(resp.data)
    //   })
    // }
    //
    // function getResourceByNewToken() {
    //   const tkurl = '/oauth2.0/token/'
    //   const rsrcurl = '/oauth2.0/resource/'
    //   axios.get(tkurl).then(resp=>{
    //     const token = resp.data.access_token
    //     const ts = new Date().getTime() / 1000  // 秒级时间戳
    //     const nonce = CryptoJS.MD5(ts + Math.floor(Math.random()*1000)).toString()
    //     const signstr = `token:##${token}##-&-timestamp:##${ts}##-&-nonce:##${nonce}##`
    //     const sign = CryptoJS.MD5(signstr).toString()
    //     axios.get(rsrcurl, {
    //       headers: {
    //         authorization: token,
    //         ts,
    //         nonce,
    //         sign,
    //       }}).then(resp=>{
    //       console.log(resp.data)
    //     })
    //   })
    // }
    //
    //
    // function getResourceByRouteToken() {
    //   const token = record.route.query.token
    //   const rsrcurl = '/oauth2.0/resource/'
    //   const ts = new Date().getTime() / 1000  // 秒级时间戳
    //   const noncestr = (ts + Math.round(Math.random()*1000)).toString()
    //   const nonce = CryptoJS.MD5(noncestr).toString()
    //   record.token = token
    //   record.ts = ts
    //   record.nonce = nonce
    //   const signstr = `token:##${token}##-&-timestamp:##${ts}##-&-nonce:##${nonce}##`
    //   const sign = CryptoJS.MD5(signstr).toString()
    //   axios.get(rsrcurl, {
    //     headers: {
    //       authorization: token,
    //       ts,
    //       nonce,
    //       sign,
    //     }}).then(resp=>{
    //       console.log(resp.data)
    //   })
    // }
    //
    // function getResourceByRecord() {
    //   const token = record.route.query.token
    //   const rsrcurl = '/oauth2.0/resource/'
    //   const ts = record.ts
    //   const nonce = record.nonce
    //   const signstr = `token:##${token}##-&-timestamp:##${ts}##-&-nonce:##${nonce}##`
    //   const sign = CryptoJS.MD5(signstr).toString()
    //   axios.get(rsrcurl, {
    //     headers: {
    //       authorization: token,
    //       ts,
    //       nonce,
    //       sign,
    //     }}).then(resp=>{
    //       console.log(resp.data)
    //   })
    // }


    return {msg, loginMsg, login, logout, downLoadTest, dispatchToSite,
      rec, dispatchToSiteWithStaticToken,
      dispatchToSiteWithToken, downloadTestWithRecord, downloadTestWithToken, getTokenTest, downloadTestWithRecToken
      // loginToDjango, logoutToDjango, checkLoginToDjango, getTokenAndJump, getResourceByRouteToken, getResource, getResourceByRecord,
    }
  }
}
</script>
<style>
  .msg-line {
    display: flex;
    justify-content: center;
    width: 100%;
    border: 1px solid #cdebf5;
    border-radius: 5px;
  }
  .msg-line-center {
    width: 75%;
    min-height: 100px;
    overflow: auto;
  }
  .rec-line-center {
    width: 75%;
  }
  .token {
    min-height: 50px;
  }
  .form-line {
    margin: 1px;
  }
  .msg-line:hover,
  .form-line:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transition: .1s;
  }
  .form-line .form-label {
    display: inline-block;
    width: 100px;
  }
  .form-line .form-input {
    font-size: 18px;
    height: 40px;
    width: 250px;
    transition: .1s;
  }
  .tk-input {
    font-size: 15px;
    height: 25px;
    width: 100%;
    transition: .1s;
  }
  .btn {
    vertical-align: top;
    width: 140px;
    height: 80px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin: 0 1px;
    transition: .2s;
    background-color: #eaeaea;
    border: 2px solid #a8a8a8;
    border-radius: 10px;
  }
  .btn:hover {
    background-color: #dcdcdc;
    border: 2px solid #959595;
    /*letter-spacing: 3px;*/
    /*text-indent: 3px;*/
  }
</style>
