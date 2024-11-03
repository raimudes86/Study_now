// app/javascript/controllers/get_realtime_users_controller.js
import { Controller } from "stimulus";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFirebaseStore } from "../firebase";

export default class extends Controller {
  static targets = ["output", "study"];

  connect() {
    console.log("UserListController connected");

    // Firestoreの初期化
    const db = getFirebaseStore();

    // usersコレクションのリアルタイムリスナーを設定
    const usersCollection = collection(db, "users");
    
    const followingIdsJson = this.element.dataset.followingIds;
    const followingIds = JSON.parse(followingIdsJson)

    const followingUsers = query(usersCollection, where("uid", "in", followingIds))

    // onSnapshotを使ってリアルタイムでデータを取得
    onSnapshot(followingUsers, (snapshot) => {
      let users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      if (this.timer) {
        clearInterval(this.timer);
      }

      this.displayUsers(users);
      this.startTimer(users);
    });
  }

  displayUsers(users) {
    this.users = users; // ユーザー情報を保存
    this.updateDisplay(); // 初期表示を更新
  }

  startTimer(users) {
    this.timer = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  updateDisplay() {
    const now = new Date();
    this.outputTarget.innerHTML = this.users
      .filter(user => (user.is_study === 1 || user.is_study === 2))
      .map(user => {
        let ellapsed_time;
        let display_time;
        if (user.is_study === 1) {
          ellapsed_time = Math.floor(((now - user.start_time.toDate()) - user.total_pause_duration)/1000);
          display_time = this.formatTimeDisplay(ellapsed_time);
          return `<div class="user-card">
                    <div class="user-info">
                      <!-- SVGでのシンプルなアバターアイコン -->
                      <svg width="30" height="30" class="avatar-icon">
                        <circle cx="15" cy="15" r="15" fill="#ccc"></circle>
                        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">👤</text>
                      </svg>
                      <h3 class="user-name">${user.name}</h3>
                    </div>
                    <p><strong>経過時間:</strong> <span class="highlighted-time">${display_time}</span></p>
                    <p><strong>ステータス:</strong> 一時停止中</p>
                    <p><strong>詳細:</strong> ${user.text} | ${user.place} | ${user.comment}</p>
                  </div>`;
        } else if (user.is_study === 2) {
          ellapsed_time = Math.floor(((user.paused_time.toDate() - user.start_time.toDate()) - user.total_pause_duration)/1000);
          display_time = this.formatTimeDisplay(ellapsed_time);
          return `<div class="user-card">
                    <div class="user-info">
                      <!-- SVGでのシンプルなアバターアイコン -->
                      <svg width="30" height="30" class="avatar-icon">
                        <circle cx="15" cy="15" r="15" fill="#ccc"></circle>
                        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">👤</text>
                      </svg>
                      <h3 class="user-name">${user.name}</h3>
                    </div>
                    <p><strong>経過時間:</strong> <span class="highlighted-time">${display_time}</span></p>
                    <p><strong>ステータス:</strong> 一時停止中</p>
                    <p><strong>詳細:</strong> ${user.text} | ${user.place} | ${user.comment}</p>
                  </div>`;
        }
      })
      .join("");
    this.studyTarget.classList.remove("hidden");
  }

  disconnect() {
    clearInterval(this.timer); // タイマーをクリア
  }

  formatTimeDisplay(time) {
    const hours = String(Math.floor(time / (60*60))).padStart(2, 0);
    const minutes = String(Math.floor((time % (60*60)) / 60)).padStart(2, 0);
    const seconds = String(Math.floor(time % 60)).padStart(2, 0);
    return `${hours}:${minutes}:${seconds}`;
  }
}
