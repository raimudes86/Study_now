// app/javascript/controllers/timer_controller.js
import { Controller } from "stimulus";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"; 
import { getFirebaseStore } from "../firebase";

export default class extends Controller {
  static targets = ["output"];

  initialize(){
    this.uid = "Tm1Mv7FLpscyRzErRXTgGbzmKdZ2" ;
    this.currentAction = "start";
  }

  async nextAction(event){
    event.preventDefault();

    if (this.currentAction === "start") {
      await this.start(event);
      this.currentAction = "stop";//次は一時停止に
      this.outputTarget.textContent = "一時停止";
    } else if (this.currentAction === "stop") {
      await this.stop(event);
      this.currentAction = "restart";//次は再開に
      this.outputTarget.textContent = "再開";
    } else if (this.currentAction === "restart") {
      await this.restart(event);
      this.currentAction = "stop";//次は一時停止に
      this.outputTarget.textContent = "一時停止";
    }
  }



  async start(event){
    event.preventDefault();
    const db = getFirebaseStore();
    const docRef = doc(db, "users", this.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const newIsStudy = 1; // フラグを勉強中(1)に
          const now = new Date();
          await updateDoc(docRef, { is_study: newIsStudy, start_time: now });
        } else {
          console.log("There is no user");
        }
      } catch (e) {
        console.log("error", e);
      }
  }
  async stop(event){
    event.preventDefault();
    const db = getFirebaseStore();
    const docRef = doc(db, "users", this.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const newIsStudy = 2; // フラグを停止(2)に
          const now = new Date();
          await updateDoc(docRef, { is_study: newIsStudy, paused_time: now});
        } else {
          console.log("There is no user");
        }
      } catch (e) {
        console.log("error", e);
      }
  }
  async restart(event){
    event.preventDefault();
    const db = getFirebaseStore();
    const docRef = doc(db, "users", this.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const newIsStudy = 1; // フラグを勉強中(1)に
          const latest_duration = docSnap.data().total_pause_duration;
          const now = new Date();
          const latest_paused_time = docSnap.data().paused_time.toDate();
          //新しいdurationに更新
          //durationはnumber型、nowとtmp_paused_timeはDate型、now-tmp_paused_timeはnumber型(ミリ秒単位)
          //つまりnew_duration(number型の秒) = now_duration(秒) + (ミリ秒)
          const new_duration = latest_duration + (now - latest_paused_time);
          await updateDoc(docRef, { is_study: newIsStudy, total_pause_duration:new_duration });
        } else {
          console.log("There is no user");
        }
      } catch (e) {
        console.log("error", e);
      }
  }
  async finish(event){
    event.preventDefault();
    const db = getFirebaseStore();
    const docRef = doc(db, "users", this.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const newIsStudy = 0; // フラグを停止(2)に
          await updateDoc(docRef, { is_study: newIsStudy, total_pause_duration: 0});
          this.currentAction = "start";//次始まる時は開始から
          this.outputTarget.textContent = "開始";
        } else {
          console.log("There is no user");
        }
      } catch (e) {
        console.log("error", e);
      }
  }

  async updateStudyFlag(event) {
    //フォーム送信とかを押した時にサーバー側が動かないように？
    event.preventDefault();
    console.log("hello");

    const uid = this.data.get("uid")

    const db = getFirebaseStore();
    const docRef = doc(db, "users", uid);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newIsStudy = 0; // フラグをトグル
        await updateDoc(docRef, { is_study: newIsStudy });
      } else {
        console.log("No");
      }
    } catch (e) {
      console.log("error", e);
    }
  }
}