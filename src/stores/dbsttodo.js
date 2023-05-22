import { defineStore } from "pinia";
import { uid } from "quasar";
import todoApi from "src/apis/todoApi";

export default defineStore("useStoreTodo", {

  state:()=>({
      tasks:[],
  }),

  getters : {

  },

  actions: {

    async insertTodo(title){
      // db에 넣기 return id

      const result = await todoApi.create(payload);
      if (result.status == 200) {
        if (result.data.id) {
          // front
          this.tasks.unshift({
            id: result.data.id,
            title: this.newTask,
            done: "N",
          });
          this.totalCount++;
        }
        await this.$q.notify({
          message: `${this.newTask} 추가하셨습니다`,
          icon: "home",
          color: "primary",
        });
        this.newTask = "";
      }
    },
    async fetchData() {
      const len = 5;
      const lastId = this.tasks.length
        ? this.tasks[this.tasks.length - 1].id
        : 0;

      if (this.tasks.length > 0 && this.tasks.length == this.totalCount) {
        console.log("fetchData 호출안함", this.tasks.length, this.totalCount);
        return false;
      }
      const payload = {
        lastId,
        len,
      };
      const result = await todoApi.list(payload);
      if (result.data && result.data.list) {
        this.tasks = [...this.tasks, ...result.data.list];
        this.totalCount = result.data.totalCount;
      }
    },

    async removeDBItem(id) {
      // 배열 안 오브젝트일때 idx
      const idx = this.tasks.findIndex((task) => task.id == item.id);
      //삭제 array.splice(시작 index, 제거 index, 추가 요소)
      this.tasks.splice(idx, 1);
      const result = await todoApi.remove(item);
      if (result.status == 200) {
        await this.$q.notify({
          message: `${item.title} 삭제하셨습니다`,
          icon: "home",
          color: "primary",
        });
      }
    },
    async editDBTodo(item) {
      //배열에서 수정하되 done은 'n'으로
      const idx = this.tasks.findIndex((task) => task == item);
      item.done = "N";
      this.tasks.splice(idx, 1, item);

      if (this.editTask.title != this.origin) {
        //타이틀이 다를때만 수정
        await todoApi.update(item);
        await this.$q.notify({
          message: `${item.title} 수정하셨습니다`,
          icon: "home",
          color: "primary",
        });
      }
    },
    async resetDb() {
			if (this.tasks) {
        this.tasks = [];
      }
      const payload = {
        title: "todo_",
        done: "N",
        len: 100,
      };
      const result = await todoApi.reset(payload);
      if (result.status == 200) {
        console.log(result.status);
        this.fetchData();
      }
    },
  }
})
