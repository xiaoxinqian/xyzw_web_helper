<template>
  <div class="legion-war-statistics-container">
    <div class="legion-war-statistics-card">
      <div v-if="!isAccessible" class="access-denied-container">
        <n-result status="403" title="暂未开放" description="该功能仅在特定时间开放">
          <template #footer>
            <div class="access-denied-info">
              <p>开放时间：</p>
              <p>1. 每月前四周的周六 19:55 - 21:00</p>
              <p>2. 每月第四周的周日 19:55 - 21:30</p>
              <p>3. 2026年3月年赛特殊开放</p>
            </div>
          </template>
        </n-result>
      </div>
      <template v-else>
      <!-- 头部信息区 -->
      <div class="header-section">
        <div class="header-left">
          <img src="/icons/moonPalace.png" alt="盐场图标" class="header-icon" />
          <div class="header-title">
            <h2>盐场实时战况</h2>
            <p>实时获取俱乐部盐场数据</p>
          </div>
        </div>
      </div>

      <!-- 功能操作区 -->
      <div class="function-section">
        <div class="function-left">
          <n-radio-group v-model:value="viewMode" size="small">
            <n-radio-button value="legion">战队战况</n-radio-button>
            <n-radio-button value="individual">个人战况</n-radio-button>
          </n-radio-group>
          
          <div class="stat-item">
            <span class="stat-label">连接状态:</span>
            <n-tag :type="isConnected ? 'success' : 'error'">
              {{ isConnected ? "已连接" : "未连接" }}
            </n-tag>
          </div>
          <div class="stat-item">
            <span class="stat-label">战场数据:</span>
            <n-tag :type="battlefieldId ? 'success' : 'error'">{{ battlefieldId ? "已成功获取战场数据" : "未获取到战场数据" }}</n-tag>
          </div>
          <div class="stat-item">
            <span class="stat-label">更新时间:</span>
            <n-tag type="warning">{{ lastUpdateTime || "等待数据..." }}</n-tag>
          </div>

          <n-button 
            size="small" 
            :type="isEntireBattlefield ? 'success' : 'warning'" 
            :loading="connecting"
            @click="toggleBattlefieldEntry"
          >
            <template #icon>
              <n-icon>
                <LogInOutline />
              </n-icon>
            </template>
            {{ isEntireBattlefield ? "已进入战场" : "进入战场" }}
          </n-button>

          <n-button 
            size="small" 
            type="primary" 
            :disabled="!isConnected && !isEntireBattlefield"
            @click="refreshData"
            style="margin-right: 8px"
          >
            <template #icon>
              <n-icon>
                <RefreshOutline />
              </n-icon>
            </template>
            刷新数据
          </n-button>
          
          <n-button 
            size="small" 
            type="info" 
            :loading="exporting"
            @click="exportImage"
            :disabled="!validData"
          >
            <template #icon>
              <n-icon>
                <ImageOutline />
              </n-icon>
            </template>
            导出图片
          </n-button>
        </div>
      </div>

      <!-- 表格内容区 -->
      <div class="table-content">
        <!-- 战队战况表格 -->
        <n-data-table
          v-if="viewMode === 'legion'"
          :columns="legionColumns"
          :data="legionData"
          :loading="false"
          :pagination="{ pageSize: 20 }"
          size="small"
          :max-height="tableMaxHeight"
          :row-class-name="rowClassName"
        >
          <template #empty>
            <div class="empty-state">
              <template v-if="connecting">
                <div class="loading-container">
                  <n-spin size="large" />
                  <p>正在连接战场...</p>
                </div>
              </template>
              <template v-else-if="isConnected">
                <div class="loading-container">
                  <n-spin size="large" />
                  <p>正在获取战况数据...</p>
                </div>
              </template>
              <template v-else>
                <n-empty description="暂无战场数据，请手动刷新数据">
                  <template #icon>
                    <n-icon>
                      <StatsChart />
                    </n-icon>
                  </template>
                </n-empty>
              </template>
            </div>
          </template>
        </n-data-table>

        <!-- 个人战况表格 -->
        <n-data-table
          v-else
          :columns="individualColumns"
          :data="individualData"
          :loading="false"
          :pagination="{ pageSize: 30 }"
          size="small"
          :max-height="tableMaxHeight"
        >
          <template #empty>
            <div class="empty-state">
              <template v-if="connecting">
                <div class="loading-container">
                  <n-spin size="large" />
                  <p>正在连接战场...</p>
                </div>
              </template>
              <template v-else-if="isConnected">
                <div class="loading-container">
                  <n-spin size="large" />
                  <p>正在获取战况数据...</p>
                </div>
              </template>
              <template v-else>
                <n-empty description="暂无战场数据，请手动刷新数据">
                  <template #icon>
                    <n-icon>
                      <StatsChart />
                    </n-icon>
                  </template>
                </n-empty>
              </template>
            </div>
          </template>
        </n-data-table>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useMessage } from "naive-ui";
import { useTokenStore } from "@/stores/tokenStore";
import { useLegionWarStore } from "@/stores/legionWarStore";
import { extractValidData, formatPower } from "@/utils/legionWar";
import { getCurrentTimeByFormat } from "@/utils/DateTimeUtils";
import { isLegionWarAccessible } from "@/utils/clubBattleUtils";
import { storeToRefs } from "pinia";
import html2canvas from "html2canvas";
import { 
  LogInOutline, 
  MegaphoneOutline, 
  StatsChart,
  RefreshOutline,
  ImageOutline
} from "@vicons/ionicons5";

const message = useMessage();
const tokenStore = useTokenStore();
const legionWarStore = useLegionWarStore();

const isAccessible = ref(isLegionWarAccessible());

// Store 状态
const { 
  isConnected, 
  connecting, 
  validData, 
  battlefieldId, 
  lastUpdateTime,
  legionDetails,
  isJoined: isEntireBattlefield 
} = storeToRefs(legionWarStore);

// 状态
const viewMode = ref("legion"); // legion | individual
const exporting = ref(false);
const tableMaxHeight = ref(600);

const exportImage = async () => {
  const element = document.querySelector(".legion-war-statistics-card .table-content");
  if (!element) {
    message.error("未找到导出内容");
    return;
  }

  exporting.value = true;
  // 临时移除最大高度以截取完整内容
  const originalMaxHeight = tableMaxHeight.value;
  tableMaxHeight.value = undefined;

  try {
    await nextTick();
    // 等待一点时间确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2, // Higher quality
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    const modeName = viewMode.value === "legion" ? "俱乐部战况" : "个人战况";
    link.download = `盐场${modeName}_${getCurrentTimeByFormat("yyyyMMdd_HHmmss")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    message.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    message.error("导出失败");
  } finally {
    tableMaxHeight.value = originalMaxHeight;
    exporting.value = false;
  }
};

// 战队数据处理
const legionData = computed(() => {
  if (!validData.value?.legionInfo) return [];
  return Object.values(validData.value.legionInfo)
    .map(item => {
      const detail = legionDetails.value[item.id];
      // 优先使用详情中的红淬数据 (quenchNum)
      const realRedCount = detail?.quenchNum !== undefined ? detail.quenchNum : item.redCount;
      // 优先使用详情中的战力数据 (power)
      const realPower = detail?.power !== undefined ? detail.power : item.power;
      return {
        ...item,
        redCount: realRedCount,
        power: realPower,
        key: item.id
      };
    })
    .sort((a, b) => b.score - a.score);
});

// 个人数据处理
const individualData = computed(() => {
  if (!validData.value?.memberInfo) return [];
  const myLegionId = tokenStore.gameData?.roleInfo?.role?.legionId;
  
  // 筛选本俱乐部成员并排序
  return Object.values(validData.value.memberInfo)
    .filter(item => item.legionId == myLegionId)
    .map((item, index) => ({
      ...item,
      key: index,
      kd: item.die > 0 ? (item.kill / item.die).toFixed(2) : item.kill.toFixed(2)
    }))
    .sort((a, b) => b.kill - a.kill);
});

// 表格列定义
const legionColumns = [
  { 
    title: "排名", 
    key: "rank", 
    width: 60,
    render: (_, index) => index + 1
  },
  { 
    title: "俱乐部名称", 
    key: "name",
    width: 150,
    render: (row) => {
      return  row.name
    }
  },
  { 
    title: "击杀数", 
    key: "killCnt", 
    sorter: (a, b) => a.killCnt - b.killCnt 
  },
  { 
    title: "免费复活", 
    key: "reviveCount", 
    render: (row) => `${row.reviveCount}/150` 
  },
  { 
    title: "积分", 
    key: "score", 
    sorter: (a, b) => a.score - b.score 
  },
  { 
    title: "红数", 
    key: "redCount", 
    sorter: (a, b) => a.redCount - b.redCount 
  },
  { 
    title: "战力", 
    key: "power", 
    render: (row) => formatPower(row.power),
    sorter: (a, b) => a.power - b.power 
  },
  { 
    title: "人数", 
    key: "participantsCount", 
    render: (row) => `${row.participantsCount}/30` 
  },
  { 
    title: "花费总丹", 
    key: "danCount", 
    sorter: (a, b) => a.danCount - b.danCount 
  },
  { 
    title: "四圣", 
    key: "blessingInfo", 
    render: (row) => `${row.blessingCount}个共${row.blessingScore}分` 
  }
];

const individualColumns = [
  { 
    title: "排名", 
    key: "rank", 
    width: 60,
    render: (_, index) => index + 1
  },
  { 
    title: "名称", 
    key: "name",
    width: 120
  },
  { 
    title: "击杀数", 
    key: "kill", 
    sorter: (a, b) => a.kill - b.kill 
  },
  { 
    title: "死亡次数", 
    key: "die", 
    sorter: (a, b) => a.die - b.die 
  },
  { 
    title: "已复活次数", 
    key: "revive", 
    render: (row) => `${row.revive}/5` 
  },
  { 
    title: "积分", 
    key: "score", 
    sorter: (a, b) => a.score - b.score 
  },
  { 
    title: "刨地", 
    key: "digGround", 
    sorter: (a, b) => a.digGround - b.digGround 
  },
  { 
    title: "复活丹", 
    key: "dan", 
    sorter: (a, b) => a.dan - b.dan 
  },
  { 
    title: "K/D", 
    key: "kd", 
    sorter: (a, b) => parseFloat(a.kd) - parseFloat(b.kd) 
  }
];

// 行样式
const rowClassName = (row) => {
  // 可以根据俱乐部ID高亮显示自己的俱乐部
  const myLegionId = tokenStore.gameData?.roleInfo?.role?.legionId;
  if (row.id == myLegionId) {
    return 'my-legion-row';
  }
  return '';
};

const toggleBattlefieldEntry = async () => {
  if (isEntireBattlefield.value) {
    legionWarStore.disconnect(true); // 强制断开
  } else {
    try {
      await legionWarStore.connect();
    } catch (error) {
      message.error(error.message);
    }
  }
};

const refreshData = () => {
  try {
    legionWarStore.refreshData();
    message.success("已发送刷新请求");
  } catch (error) {
    message.warning(error.message);
  }
};

// 生命周期钩子
onMounted(() => {
  // 组件加载时尝试连接
  try {
    legionWarStore.connect().catch(e => {
        console.error("Auto connect failed", e);
    });
  } catch (e) {
      // ignore
  }
});

onUnmounted(() => {
   // 组件卸载时断开连接（减少引用计数）
  legionWarStore.disconnect();
});
</script>

<style scoped lang="scss">
.legion-war-statistics-container {
  padding: 8px;
  
  .legion-war-statistics-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 
                0 3px 6px 0 rgba(0, 0, 0, 0.06), 
                0 5px 12px 4px rgba(0, 0, 0, 0.04); 
    
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 600px; /* 给个固定高度或者 min-height */
      padding: 40px;
    }

    .access-denied-info {
      margin-top: 16px;
      text-align: left;
      color: #666;
      
      p {
        margin: 4px 0;
      }
    }

    .header-section {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      flex-wrap: wrap;
      gap: 12px;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .header-icon {
          width: 40px;
          height: 40px;
        }
        
        .header-title {
          h2 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }
          p {
            margin: 4px 0 0;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
    
    .function-section {
      padding: 12px 16px;
      background: #f9f9f9;
      border-bottom: 1px solid #eee;
      
      .function-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .stat-label {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
    
    .table-content {
      padding: 16px;
      min-height: 400px;
      
      .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
        color: #999;
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
      }
    }
  }
}

:deep(.my-legion-row) {
  td {
    background-color: #f0fdf4 !important;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
