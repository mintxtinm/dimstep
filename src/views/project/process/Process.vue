<template>
  <v-container fluid grid-list-md style="padding:0">
    <v-layout row wrap>
      <v-flex xs12 style="padding:0">
        <v-toolbar flat class="transparent">
          <v-layout>
            <v-flex xs3>
              <v-text-field
                prepend-inner-icon="mdi-magnify"
                hide-details
                outlined
                single-line
                dense
                class="ml-1"
                label="搜索过程 & 任务"
                v-model="searchProcessContent"
              ></v-text-field>
            </v-flex>
            <v-spacer></v-spacer>
            <v-btn
              v-if="projectPermission(authorization.userID).indexOf(`c`) != -1"
              outlined
              color="primary"
              @click="createProcessDialog = true"
              >+ 新过程</v-btn
            >
          </v-layout>
        </v-toolbar>

        <v-sheet v-if="processListShow.length >= 1" color="transparent">
          <transition appear appear-active-class="fade-left-enter">
            <v-slide-group center-active show-arrows style="height:100%">
              <v-slide-item
                draggable="true"
                v-for="(item, i) in processListShow"
                :key="`process-${item.id}`"
              >
                <div
                  :class="i == 0 ? 'ml-5 my-2 mr-2' : `mx-2 my-2`"
                  style="width:300px"
                >
                  <process-column
                    :processID="item.id"
                    :processName="item.name"
                  ></process-column>
                </div>
              </v-slide-item>
            </v-slide-group>
          </transition>
        </v-sheet>
        <v-sheet color="transparent" v-else style="height:calc(100vh - 112px)">
          <v-layout fill-height justify-center align-center>
            <h3>请创建过程</h3>
          </v-layout>
        </v-sheet>
      </v-flex>
    </v-layout>
    <v-dialog v-model="createProcessDialog" width="300" persistent>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title class="subtitle-1 font-weight-black"
            >新建过程</v-toolbar-title
          >
        </v-toolbar>
        <v-container>
          <v-text-field
            single-line
            outlined
            dense
            label="项目名称"
            v-model="processName"
          ></v-text-field>
        </v-container>
        <v-card-actions class="justify-center">
          <v-btn rounded color="primary" depressed @click="createProcess"
            >确认</v-btn
          >
          <v-btn rounded text @click="createProcessDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import processColumn from '@/components/project/process/ProcessColumn.vue';
import ProcessService from '@/service/processService';
import { Process } from '@/types/process';
import { Authorization } from '@/types/user';

const projectModule = namespace('project');
const processModule = namespace('process');
const userModule = namespace('user');

@Component({
  components: {
    'process-column': processColumn
  }
})
export default class ProcessList extends Vue {
  @userModule.Getter('authorization') private authorization!: Authorization;

  @projectModule.Getter('currentProjectID') private currentProjectID!: string;

  @processModule.Mutation('updateCurrentProcessList')
  private updateCurrentProcessList: any;

  @projectModule.Getter('projectPermission')
  private projectPermission: any;

  private processList: Process[] = [];
  private processListShow: Process[] = [];
  private createProcessDialog: boolean = false;
  private processName: string = '';
  private searchProcessContent: string = '';

  private async createProcess() {
    await ProcessService.createProcess(this.processName, this.currentProjectID);
    this.createProcessDialog = false;
    this.getProcessList();
  }

  private async getProcessList() {
    const rsp = await ProcessService.getProcessList(this.currentProjectID);
    this.processList = rsp.process;
    this.processListShow = rsp.process;
    this.updateCurrentProcessList(rsp.process);
  }

  @Watch('searchProcessContent')
  private onSearchProcessContentChanged() {
    this.processListShow = [];
    const { processList } = this;
    const { searchProcessContent } = this;
    for (let i = processList.length - 1; i >= 0; i--) {
      const e = processList[i];
      let flag = false;
      // process name
      if (
        e.name.toLowerCase().indexOf(searchProcessContent.toLowerCase()) !== -1
      ) {
        flag = true;
      }

      // task name
      for (const item of e.task!.data) {
        if (
          item.name
            .toLowerCase()
            .indexOf(searchProcessContent.toLowerCase()) !== -1
        ) {
          flag = true;
        }
      }

      if (flag) {
        console.log(e);
        this.processListShow.unshift(e);
      }
    }
  }

  @Watch('currentProjectID')
  private onCurrentProjectIDChanged() {
    this.getProcessList();
  }

  private mounted() {
    this.getProcessList();
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  display: block;
}
</style>
