<template>
  <q-page class="bg-grey-3 column">
    <div class="row q-pa-sm bg-primary">
      <q-input
        v-model="newTask"
        @keyup.enter="addDbTask"
        class="col"
        bg-color="white"
        filled
        aria-placeholder="Add task"
        dense
      >
        <template v-slot:append>
          <q-btn @click="addDbTask" round dense flat icon="add"></q-btn>
        </template>
      </q-input>
    </div>

    <!--reset btn-->
    <q-btn label="reset" @click="resetDb"></q-btn>
    <!--list-->
    <q-list class="bg-white" separator bordered>
      <q-item
        v-for="item in tasks"
        :key="item.title"
        @click="item.done = item.done == 'Y' ? 'N' : 'Y'"
        :class="{ 'done bg-blue-1': item.done === 'Y' }"
        v-ripple
        clickable
      >
        <q-item-section avatar>
          <q-checkbox
            v-model="item.done"
            color="primary"
            class="no-pointer-event"
            true-value="Y"
            false-value="N"
            dense
          ></q-checkbox>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="item.done == 'Y'" side>
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="edit"
            @click.stop="openDialog(item)"
          >
          </q-btn>
        </q-item-section>
        <q-item-section v-if="item.done == 'Y'" side>
          <q-btn
            flat
            round
            dense
            color="red"
            icon="delete"
            @click.stop="removeDBItem(item)"
          ></q-btn>
        </q-item-section>
      </q-item>
      <!--https://quasar.dev/vue-directives/intersection#intersection-api  //observed element-->
      <div v-intersection="onIntersection" v-if="tasks.length"></div>
    </q-list>
    <!--no list-->
    <div v-if="!tasks.length" class="no-tasks absolute-center">
      <q-icon name="check" size="100px" color="primary" />
      <div class="text-h5 text-primary text-center">No tasks</div>
    </div>
    <DialogCustom
      ref="dialog"
      :edit-task="editTask"
      :origin="origin"
      @onInput="editDBTodo"
    >
    </DialogCustom>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import todoApi from "src/apis/todoApi";
import useTodoStore from "src/stores/dbsttodo"
import { mapActions, mapState } from "pinia";
import DialogCustom from "components/DialogCustom.vue";

export default defineComponent({
  name: "Store Todo",
  title: "DB STORO Todo list",
  components: { DialogCustom },
  data() {
    return {
      newTask: "",
      //tasks: [],
      totalCount: 0,
      origin: null,
      editTask: null,
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    ...mapState(useTodoStore, ["tasks"])
  },
  methods: {
    ...mapActions(useTodoStore, ["insertTodo","fetchData","removeDBItem","editDBTodo","resetDb"]),
    async addDbTask() {
      if(this.newTask){
        this.insertTodo(this.newTask);

      }
      this.newTask="";
    },

    async onIntersection(entry) {
      if (entry.isIntersecting) {
        this.$q.loading.show();
        await this.fetchData();
        this.$q.loading.hide();
      }
    },
    //다이얼로그 열기
    openDialog(item) {
      this.$refs.dialog.dialog = true;
      this.editTask = item;
      this.origin = this.editTask.title;
    },
    //수정
    // async editDBTodo(item) {
    //   //배열에서 수정하되 done은 'n'으로
    //   const idx = this.tasks.findIndex((task) => task == item);
    //   item.done = "N";
    //   this.tasks.splice(idx, 1, item);

    //   if (this.editTask.title != this.origin) {
    //     //타이틀이 다를때만 수정
    //     await todoApi.update(item);
    //   }
    // },

    //삭제
    removeDBItem(item){
      this.removeDBItem(item);
      this.newTask="";
    },


    //더미리스트 만들기
    async resetDb() {
			if (this.tasks) {
        this.tasks = [];
      }
      const payload = {
        title: "todo_",
        done: "N",
        len: 20,
      };
      const result = await todoApi.reset(payload);
      if (result.status == 200) {
        console.log(result.status);
        this.fetchData();
      }
    },
  },
}
);
</script>

<style lang="scss">
.done {
  .q-item__label {
    text-decoration: line-through;
    color: #bbb;
  }
}
.no-tasks {
  opacity: 0.5;
}
</style>
