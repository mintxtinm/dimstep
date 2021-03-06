<template>
  <v-container fluid>
    <v-btn block outlined color="primary" @click="fillSheetDialog = true">
      <v-icon size="20">mdi-pencil-outline</v-icon>&nbsp;修改
    </v-btn>
    <v-btn block outlined color="primary" class="mt-2" @click="exportSheet">
      <v-icon size="20">mdi-reply-outline</v-icon>&nbsp;导出
    </v-btn>
    <v-btn block outlined color="error" class="mt-2" @click="deleteSheet">
      <v-icon size="20">mdi-delete-outline</v-icon>&nbsp;删除
    </v-btn>
    <h4 class="pt-5">表单信息</h4>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">标题</v-list-item-subtitle>
        <v-list-item-title class="body-2">{{
          sheetInfo.name
        }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">模版</v-list-item-subtitle>
        <v-list-item-title class="body-2">{{
          templateInfo.name
        }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">类型</v-list-item-subtitle>
        <v-list-item-title class="body-2">{{ templateType }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">创建时间</v-list-item-subtitle>
        <v-list-item-title class="body-2">{{
          sheetInfo.createdAt | format('yyyy-MM-dd hh:mm')
        }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">最后修改</v-list-item-subtitle>
        <v-list-item-title class="body-2">{{
          sheetInfo.updatedAt | format('yyyy-MM-dd hh:mm')
        }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <v-list-item-subtitle class="caption">创建者</v-list-item-subtitle>
        <v-list-item-title class="body-2" style="height:40px">
          <user-chip class="my-2" :userID="sheetInfo.userID"></user-chip>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <router-link :to="``"></router-link>
      </v-list-item-content>
    </v-list-item>
    <v-bottom-sheet v-model="fillSheetDialog" inset>
      <v-sheet class="text-center" height="900px" style="overflow:auto">
        <v-container fluid>
          <fill-sheet
            @closeDialog="fillSheetDialog = false"
            :templateInfo="templateInfo"
            :sheetInfo="sheetInfo"
          ></fill-sheet>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Sheet, Template } from '@/types/sheet';
import SheetService from '@/service/sheetService';
import fillSheet from '@/components/project/sheet/FillSheet.vue';

const sheetModule = namespace('sheet');
const projectModule = namespace('project');

@Component({
  components: {
    'fill-sheet': fillSheet
  }
})
export default class SheetInfo extends Vue {
  @sheetModule.Getter('type') private type: any;

  @projectModule.Getter('currentProjectID') private currentProjectID: any;

  @Prop({ default: '' }) private templateID!: string;

  @Prop({ default: '' }) private sheetID!: string;

  private sheetInfo: Sheet = new Sheet();

  private templateInfo: Template = {
    name: '',
    field: {
      data: []
    },
    type: '',
    locked: false
  };

  private fillSheetDialog: boolean = false;

  private async getSheetInfo(sheetID: string) {
    this.sheetInfo = new Sheet();
    const rsp = await SheetService.getSheetInfo(sheetID);
    this.sheetInfo = rsp.sheet;
  }

  private async getTemplateInfo(templateID: string) {
    this.templateInfo = {
      name: '',
      field: {
        data: []
      },
      type: '',
      locked: false
    };
    const rsp = await SheetService.getSheetTemplate(templateID);
    this.templateInfo = rsp.template;
  }

  private async exportSheet() {
    await SheetService.exportSheet(this.sheetID);
  }

  private async deleteSheet() {
    const res = await this.$confirm('此操作无法复原', {
      title: '确认删除?',
      buttonTrueColor: 'primary',
      dark: this.$vuetify.theme.dark
    });
    if (res) {
      const rsp = await SheetService.deleteSheet(this.sheetID, '', '');
      await SheetService.getSheetList(this.currentProjectID);
    }
  }

  @Watch('templateID')
  private onTemplateIDChanged() {
    this.getTemplateInfo(this.templateID);
  }

  @Watch('sheetID')
  private onSheetIDChanged() {
    this.getSheetInfo(this.sheetID);
  }

  get templateType() {
    if (this.templateInfo.type) {
      return this.type(this.templateInfo.type).name;
    }
    return '';
  }

  private mounted() {
    this.getTemplateInfo(this.templateID);
    this.getSheetInfo(this.sheetID);
  }
}
</script>

<style scoped></style>
