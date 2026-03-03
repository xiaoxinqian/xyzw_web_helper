<template>
  <div class="club-warrank-container">
    <div class="club-warrank-card">
      <!-- 头部信息区 -->
      <div class="header-section">
        <div class="header-left">
          <img
            src="/icons/moonPalace.png"
            alt="俱乐部图标"
            class="header-icon"
          />
          <div class="header-title">
            <h2>盐场匹配信息详情</h2>
            <p>俱乐部盐场匹配详情</p>
          </div>
        </div>

        <!-- 数据统计区 -->
        <div
          class="stats-section"
          v-if="battleRecords1 && battleRecords1.legionRankList"
        >
          <div class="stat-item">
            <span class="stat-label">查询日期:</span>
            <n-tag type="info">{{ formatTimestamp1(inputDate1) }}</n-tag>
          </div>
          <div class="stat-item">
            <span class="stat-label">总俱乐部数:</span>
            <n-tag type="success">{{
              battleRecords1.legionRankList.length
            }}</n-tag>
          </div>
        </div>
      </div>

      <!-- 功能操作区 -->
      <div class="function-section">
        <div class="function-left">
          <div class="export-options">
            <n-checkbox-group
              v-model:value="exportmethod"
              name="group-exportmethod"
              size="small"
            >
              <n-checkbox value="1">表格导出</n-checkbox>
              <n-checkbox value="2">图片导出</n-checkbox>
            </n-checkbox-group>
          </div>
        </div>

        <div class="function-right">
          <a-date-picker
            v-model:value="inputDate1"
            :defaultValue="inputDate1"
            @change="fetchBattleRecordsByDate"
            valueFormat="YYYY/MM/DD"
            format="YYYY/MM/DD"
            :disabled-date="disabledDate"
          />
          <n-button
            size="small"
            :disabled="loading1"
            @click="handleRefresh1"
            class="action-btn refresh-btn"
          >
            <template #icon>
              <n-icon>
                <Refresh />
              </n-icon> </template
            >刷新</n-button
          >
          <n-button
            type="primary"
            size="small"
            :disabled="!battleRecords1 || loading1"
            @click="handleExport1"
            class="action-btn export-btn"
          >
            <template #icon>
              <n-icon>
                <Copy />
              </n-icon> </template
            >导出</n-button
          >
          <n-button
            :type="isEditMode ? 'warning' : 'default'"
            size="small"
            :disabled="!battleRecords1 || loading1"
            @click="toggleEditMode"
            class="action-btn edit-btn"
          >
            <template #icon>
              <n-icon>
                <CreateOutline />
              </n-icon>
            </template>
            {{ isEditMode ? "退出编辑" : "调整排名" }}
          </n-button>
          <n-button
            type="info"
            size="small"
            :disabled="!battleRecords1 || loading1"
            @click="hcSort"
            class="action-btn sort-btn"
          >
            红淬排序</n-button
          >
          <n-button
            type="info"
            size="small"
            :disabled="!battleRecords1 || loading1"
            @click="scoreSort"
            class="action-btn sort-btn"
            v-if="ScoreShow === 1"
          >
            积分排序</n-button
          >
        </div>
      </div>

      <!-- 表格内容区 -->
      <div ref="exportDom" class="table-content">
        <!-- 公告区域 -->
        <div
          v-if="battleRecords1 && battleRecords1.legionRankList"
          class="announcement-section"
        >
          <div class="announcement-content">
            <span class="announcement-text"
              >盐场匹配信息实时更新中，请关注最新排名变化</span
            >
          </div>
        </div>

        <!-- 联盟分类标签栏 -->
        <div
          v-if="battleRecords1 && battleRecords1.legionRankList"
          class="alliance-tabs-section"
        >
          <div
            class="alliance-tab"
            :class="{ active: activeAlliance === '大联盟' }"
            @click="setActiveAlliance('大联盟')"
          >
            <span class="tab-text">大联盟</span>
            <span class="tab-count">{{
              getActiveAllianceCount("大联盟")
            }}</span>
          </div>
          <div
            class="alliance-tab"
            :class="{ active: activeAlliance === '梦盟' }"
            @click="setActiveAlliance('梦盟')"
          >
            <span class="tab-text">梦盟</span>
            <span class="tab-count">{{ getActiveAllianceCount("梦盟") }}</span>
          </div>
          <div
            class="alliance-tab"
            :class="{ active: activeAlliance === '正义联盟' }"
            @click="setActiveAlliance('正义联盟')"
          >
            <span class="tab-text">正义联盟</span>
            <span class="tab-count">{{
              getActiveAllianceCount("正义联盟")
            }}</span>
          </div>
          <div
            class="alliance-tab"
            :class="{ active: activeAlliance === '龙盟' }"
            @click="setActiveAlliance('龙盟')"
          >
            <span class="tab-text">龙盟</span>
            <span class="tab-count">{{ getActiveAllianceCount("龙盟") }}</span>
          </div>
          <div
            class="alliance-tab"
            :class="{ active: activeAlliance === '未知联盟' }"
            @click="setActiveAlliance('未知联盟')"
          >
            <span class="tab-text">未知联盟</span>
            <span class="tab-count">{{
              getActiveAllianceCount("未知联盟")
            }}</span>
          </div>
          <div
            class="alliance-tab all"
            :class="{ active: activeAlliance === 'all' }"
            @click="setActiveAlliance('all')"
          >
            <span class="tab-text">全部</span>
            <span class="tab-count">{{
              battleRecords1.legionRankList.length
            }}</span>
          </div>
        </div>
        <!-- 加载状态 -->
        <div v-if="loading1" class="loading-state">
          <n-spin size="large">
            <template #description> 正在加载盐场匹配数据... </template>
          </n-spin>
        </div>

        <!-- 匹配列表 -->
        <div
          v-else-if="battleRecords1 && battleRecords1.legionRankList"
          class="table-container"
        >
          <!-- 表格标题行 -->
          <div class="table-header">
            <div class="table-cell rank">排名</div>
            <div class="table-cell alliance">联盟</div>
            <div class="table-cell server">服务器</div>
            <div class="table-cell avatar">头像</div>
            <div class="table-cell name">名称</div>
            <div class="table-cell score" v-if="ScoreShow === 1">积分</div>
            <div class="table-cell red-quench">红淬</div>
            <div class="table-cell first-3">前三车头</div>
            <div class="table-cell power">战力</div>
            <div class="table-cell level">等级</div>
            <div class="table-cell announcement">公告</div>
          </div>

          <!-- 表格数据行 -->
          <div
            v-for="(member, index) in filteredLegionList"
            :key="member.id"
            class="table-row"
            :class="getAllianceClass(getMemberAlliance(member))"
          >
            <div class="table-cell rank">
              <div v-if="isEditMode" class="edit-rank">
                <n-input-number
                  v-model:value="manualRankings[member.id]"
                  size="small"
                  :min="1"
                  :max="20"
                  style="width: 70px"
                  :show-button="false"
                  @focus="handleRankFocus(member)"
                  @blur="handleRankBlur(member)"
                  @keydown.enter="$event.target.blur()"
                />
              </div>
              <div v-else class="rank-container">
                <span
                  v-if="getMemberRank(member) === 1"
                  class="rank-medal gold"
                ></span>
                <span
                  v-else-if="getMemberRank(member) === 2"
                  class="rank-medal silver"
                ></span>
                <span
                  v-else-if="getMemberRank(member) === 3"
                  class="rank-medal bronze"
                ></span>
                <span v-else class="rank-number">{{
                  getMemberRank(member)
                }}</span>
              </div>
            </div>
            <div class="table-cell alliance">
              <div v-if="isEditMode" class="edit-alliance">
                <n-select
                  v-model:value="manualAlliances[member.id]"
                  :options="allianceOptions"
                  size="small"
                  style="width: 110px"
                />
              </div>
              <span v-else class="alliance-tag">{{
                getMemberAlliance(member)
              }}</span>
            </div>
            <div class="table-cell server">{{ member.serverId || 0 }}</div>
            <div class="table-cell avatar">
              <img
                v-if="member.logo"
                :src="member.logo"
                :alt="member.name"
                class="member-avatar"
                @error="handleImageError"
              />
              <div v-else class="member-avatar-placeholder">
                {{ member.name?.charAt(0) || "?" }}
              </div>
            </div>
            <div class="table-cell name">{{ member.name }}</div>
            <div class="table-cell score" v-if="member.sRScore !== -1">
              {{ formatScore(member.sRScore) || 0 }}
            </div>
            <div class="table-cell red-quench">{{ member.redQuench || 0 }}</div>
            <div class="table-cell first-3">
              <div class="hero-avatars">
                <div
                  v-for="(hero, index) in member.topHeroes"
                  :key="index"
                  class="hero-card"
                >
                  <div
                    class="hero-avatar-container"
                    @click="handleHeroClick(hero)"
                  >
                    <img
                      v-if="hero.headImg"
                      :src="hero.headImg"
                      :alt="hero.name"
                      class="hero-avatar"
                    />
                    <div v-else class="hero-avatar-placeholder">
                      {{ hero.name?.charAt(0) || "?" }}
                    </div>
                    <div class="hero-holy-beast" title="四圣数">
                      <span class="holy-beast-icon">🐉</span>
                      <span class="holy-beast-count">{{ hero.holyBeast }}</span>
                    </div>
                  </div>
                  <div class="hero-info">
                    <div class="hero-name">{{ hero.name || "未知" }}</div>
                    <div class="hero-stats">
                      <span class="hero-power">{{
                        formatPower(hero.power)
                      }}</span>
                      <span
                        class="hero-redquench"
                        :class="getRedQuenchClass(hero.redQuench)"
                        >{{ hero.redQuench }}红</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="table-cell power">
              {{ formatPower(member.power) || 0 }}
            </div>
            <div class="table-cell level">
              <span>{{ member.level || 30 }}</span>
            </div>
            <div class="table-cell announcement">
              {{ member.announcement || "" }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading1" class="empty-state">
          <n-empty description="暂无盐场匹配数据" size="large">
            <template #icon>
              <n-icon>
                <DocumentText />
              </n-icon>
            </template>
          </n-empty>
        </div>
      </div>
    </div>

    <!-- 玩家信息模态框 -->
    <n-modal
      v-model:show="showPlayerInfoModal"
      preset="card"
      title="对手信息"
      :style="{ width: '800px' }"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
      :show-close="false"
    >
      <template #header-extra>
        <span v-if="playerInfo" class="player-id">ID: {{ playerInfo.id }}</span>
      </template>

      <div v-if="playerInfo" class="player-info-content">
        <div class="player-info-main">
          <n-avatar
            round
            :size="60"
            :src="playerInfo.headImg"
            class="player-avatar"
          />
          <div class="player-info-detail">
            <h3>
              {{ playerInfo.name }}
              <n-tag
                v-if="playerInfo.legacy > 0"
                :style="{
                  color: '#fff',
                  backgroundColor: legacycolor[playerInfo.legacy]?.value,
                }"
                size="small"
                style="margin-left: 8px"
              >
                {{ legacycolor[playerInfo.legacy]?.name || "未知" }}
              </n-tag>
            </h3>
            <p>
              区服: {{ playerInfo.serverName || "未知" }} | 战力:
              {{ formatPower(playerInfo.power) }}
            </p>
            <p>俱乐部: {{ playerInfo.legionName || "无" }}</p>
            <p>
              总红数: {{ playerInfo.totalRedCount || 0 }} | 总开孔数:
              {{ playerInfo.totalHoleCount || 0 }} | 四圣数:
              {{ playerInfo.holyBeast || 0 }}
            </p>
          </div>
        </div>

        <div class="action-section">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1">
            <div class="fight-count-container">
              <label for="fightCount" class="fight-count-label"
                >切磋次数:</label
              >
              <n-input
                id="fightCount"
                v-model:value="fightCount"
                type="number"
                placeholder="请输入切磋次数"
                min="1"
                max="100"
                :step="1"
                class="fight-count-input"
                size="small"
                @input="validateFightCount"
              />
              <div class="fight-count-hint">范围: 1-100</div>
            </div>
            <n-button
              type="tertiary"
              @click="showPlayerInfoModal = false"
              size="small"
              style="margin-right: 8px"
            >
              关闭
            </n-button>
          </div>
          <n-button
            type="primary"
            @click="handleDuel"
            :disabled="!isFightCountValid"
          >
            切磋
          </n-button>
        </div>

        <!-- 切磋进度和结果 -->
        <div v-if="fightProgress.visible" class="fight-progress">
          <div class="progress-info">
            <div class="progress-title">切磋进行中</div>
            <div class="progress-stats">
              <span>总次数: {{ fightProgress.totalCount }}</span>
              <span>已完成: {{ fightProgress.completedCount }}</span>
              <span>剩余: {{ fightProgress.remainingCount }}</span>
              <span>胜: {{ fightProgress.winCount }}</span>
              <span>负: {{ fightProgress.lossCount }}</span>
            </div>
          </div>
          <n-progress
            type="line"
            :percentage="fightProgress.percentage"
            :show-indicator="false"
            :stroke-width="8"
            status="processing"
          />
        </div>

        <!-- 最终结果统计 -->
        <div v-if="fightResult.visible" class="fight-result">
          <!-- 结果标题和统计信息 -->
          <div class="result-header">
            <h4 class="result-title">切磋结果</h4>
            <div class="result-summary">
              <div class="summary-item">
                <span class="summary-label">总次数：</span>
                <span class="summary-value">{{ fightResult.totalCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">胜：</span>
                <span class="summary-value win">{{
                  fightResult.winCount
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">负：</span>
                <span class="summary-value loss">{{
                  fightResult.lossCount
                }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">胜率：</span>
                <span class="summary-value"
                  >{{
                    (
                      (fightResult.winCount / fightResult.totalCount) *
                      100
                    ).toFixed(2)
                  }}%</span
                >
              </div>
              <div class="summary-item">
                <span class="summary-label">我方掉将率：</span>
                <span class="summary-value"
                  >{{
                    (
                      (dieStats.ourDieHeroGameCount / fightResult.totalCount) *
                      100
                    ).toFixed(2)
                  }}%</span
                >
              </div>
              <div class="summary-item">
                <span class="summary-label">敌方掉将率：</span>
                <span class="summary-value"
                  >{{
                    (
                      (dieStats.enemyDieHeroGameCount /
                        fightResult.totalCount) *
                      100
                    ).toFixed(2)
                  }}%</span
                >
              </div>
            </div>
          </div>

          <!-- 战斗结果列表 -->
          <div class="result-list">
            <div
              v-for="(battle, index) in fightResult.resultCount"
              :key="index"
              :class="['battle-result-item', battle.isWin ? 'win' : 'loss']"
            >
              <div class="battle-header">
                <span class="battle-index">第 {{ index + 1 }} 场</span>
                <n-tag :type="battle.isWin ? 'success' : 'error'" size="small">
                  {{ battle.isWin ? "胜利" : "失败" }}
                </n-tag>
              </div>

              <div class="battle-details">
                <div class="battle-side left-side">
                  <n-avatar
                    round
                    :size="32"
                    :src="battle.leftheadImg"
                    class="side-avatar"
                  />
                  <div class="side-info">
                    <span class="side-name">{{
                      battle.leftName || "未知"
                    }}</span>
                    <span class="side-power">战力: {{ battle.leftpower }}</span>
                    <span class="side-die"
                      >掉将: {{ battle.leftDieHero }} 个</span
                    >
                  </div>
                </div>

                <div class="battle-vs">VS</div>

                <div class="battle-side right-side">
                  <n-avatar
                    round
                    :size="32"
                    :src="battle.rightheadImg"
                    class="side-avatar"
                  />
                  <div class="side-info">
                    <span class="side-name">{{
                      battle.rightName || "未知"
                    }}</span>
                    <span class="side-power"
                      >战力: {{ battle.rightpower }}</span
                    >
                    <span class="side-die"
                      >掉将: {{ battle.rightDieHero }} 个</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <n-button type="primary" @click="resetFightResult"
              >重新切磋</n-button
            >
            <n-button @click="fightResult.visible = false">关闭结果</n-button>
          </div>
        </div>

        <div class="player-heroes">
          <h4>武将阵容</h4>
          <!-- 添加调试信息 -->
          <div
            v-if="playerInfo.heroList"
            class="debug-info"
            style="font-size: 12px; color: #999; margin-bottom: 10px"
          >
            武将数量: {{ playerInfo.heroList.length }}
          </div>
          <div
            class="hero-list"
            v-if="playerInfo.heroList && playerInfo.heroList.length > 0"
          >
            <div
              v-for="(hero, index) in playerInfo.heroList"
              :key="hero.heroId || index"
              class="hero-item"
              @click="selectHeroInfo(hero)"
            >
              <n-avatar
                round
                :size="40"
                :src="hero.heroAvate"
                style="cursor: pointer"
              />
              <div class="hero-info">
                <span class="hero-name">{{ hero.heroName }}</span>
                <div class="hero-stats">
                  <span>战力: {{ formatPower(hero.power || 0) }}</span>
                  <span>星级: {{ hero.star || 0 }}</span>
                  <span>红数: {{ hero.red || 0 }}</span>
                  <span>开孔: {{ hero.hole || 0 }}</span>
                  <span :class="hero.HolyBeast ? 'opened' : 'closed'">
                    {{ hero.HolyBeast ? "已开四圣" : "未开四圣" }}
                  </span>
                  <span v-if="hero.HolyBeast"
                    >四圣等级: {{ hero.HBlevel || 0 }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-heroes">
            <p>未查询到武将信息</p>
            <!-- 添加调试信息 -->
            <div
              v-if="playerInfo.heroList"
              style="font-size: 12px; color: #999; margin-top: 10px"
            >
              武将列表为空
            </div>
            <div v-else style="font-size: 12px; color: #999; margin-top: 10px">
              武将列表未定义
            </div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 武将详情模态框 -->
    <n-modal
      v-model:show="showHeroModal"
      class="hero-detail-modal"
      preset="card"
      title="武将信息"
      size="large"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
      :style="{ width: '600px' }"
      :show-close="true"
    >
      <template #header-extra>
        <span class="hero-id">武将ID: {{ heroModealTemp?.heroId }}</span>
      </template>

      <div v-if="heroModealTemp" class="hero-modal-content">
        <div class="hero-modal-header">
          <div class="hero-modal-avatar">
            <img
              v-if="heroModealTemp.heroAvate"
              :src="heroModealTemp.heroAvate"
              :alt="heroModealTemp.heroName"
            />
            <div v-else class="hero-placeholder">
              {{ heroModealTemp.heroName?.substring(0, 2) || "?" }}
            </div>
          </div>
          <div class="hero-modal-basic">
            <h3 class="hero-modal-name">{{ heroModealTemp.heroName }}</h3>
            <div class="hero-modal-stats">
              <span class="stat-item">{{
                formatPower(heroModealTemp.power)
              }}</span>
              <span class="stat-item">等级: {{ heroModealTemp.level }}</span>
              <span class="stat-item">星级: {{ heroModealTemp.star }}</span>
              <n-tag :type="heroModealTemp.HolyBeast ? 'success' : 'warning'">
                {{ heroModealTemp.HolyBeast ? "已激活" : "未激活" }}
              </n-tag>
            </div>
          </div>
        </div>

        <div class="hero-modal-details">
          <n-descriptions label-placement="left" column="3" bordered>
            <n-descriptions-item label="战力">
              {{ formatPower(heroModealTemp.power) }}
            </n-descriptions-item>
            <n-descriptions-item label="等级">
              {{ heroModealTemp.level }}
            </n-descriptions-item>
            <n-descriptions-item label="星级">
              {{ heroModealTemp.star }}
            </n-descriptions-item>
            <n-descriptions-item label="开孔数">
              {{ heroModealTemp.hole }}
            </n-descriptions-item>
            <n-descriptions-item label="红孔数">
              {{ heroModealTemp.red }}
            </n-descriptions-item>
            <n-descriptions-item label="四圣状态">
              {{ heroModealTemp.HolyBeast ? "已激活" : "未激活" }}
            </n-descriptions-item>
            <n-descriptions-item
              label="四圣等级"
              v-if="heroModealTemp.HolyBeast"
            >
              {{ heroModealTemp.HBlevel }}
            </n-descriptions-item>
            <n-descriptions-item label="鱼灵">
              {{
                heroModealTemp?.PearlInfo?.FishInfo?.name != undefined
                  ? heroModealTemp.PearlInfo?.FishInfo?.name
                  : "无"
              }}
            </n-descriptions-item>
            <n-descriptions-item label="鱼珠技能">
              {{
                heroModealTemp?.PearlInfo?.PearlSkill?.name != undefined
                  ? heroModealTemp.PearlInfo?.PearlSkill?.name
                  : "无"
              }}
            </n-descriptions-item>
            <n-descriptions-item label="鱼灵洗练">
              <div v-if="heroModealTemp?.PearlInfo?.slotMap?.length > 0">
                <div
                  v-for="item in heroModealTemp.PearlInfo.slotMap"
                  :key="item.id"
                  class="ModalEquipment"
                  :style="'background-color:' + item.value"
                ></div>
              </div>
              <div v-else>无</div>
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <div class="hero-modal-equipment">
          <h4 class="section-title">装备详情</h4>
          <div class="equipment-grid">
            <div class="equipment-item">
              <span class="equipment-label">武器:</span>
              <div class="equipment-slots">
                <div
                  v-for="(item, idx) in Object.values(
                    Object.values(heroModealTemp.equipment)[0]?.quenches || {},
                  )"
                  :key="idx"
                  class="equipment-slot"
                  :class="{ 'red-slot': item.colorId === 6 }"
                ></div>
              </div>
            </div>
            <div class="equipment-item">
              <span class="equipment-label">衣服:</span>
              <div class="equipment-slots">
                <div
                  v-for="(item, idx) in Object.values(
                    Object.values(heroModealTemp.equipment)[1]?.quenches || {},
                  )"
                  :key="idx"
                  class="equipment-slot"
                  :class="{ 'red-slot': item.colorId === 6 }"
                ></div>
              </div>
            </div>
            <div class="equipment-item">
              <span class="equipment-label">头盔:</span>
              <div class="equipment-slots">
                <div
                  v-for="(item, idx) in Object.values(
                    Object.values(heroModealTemp.equipment)[2]?.quenches || {},
                  )"
                  :key="idx"
                  class="equipment-slot"
                  :class="{ 'red-slot': item.colorId === 6 }"
                ></div>
              </div>
            </div>
            <div class="equipment-item">
              <span class="equipment-label">坐骑:</span>
              <div class="equipment-slots">
                <div
                  v-for="(item, idx) in Object.values(
                    Object.values(heroModealTemp.equipment)[3]?.quenches || {},
                  )"
                  :key="idx"
                  class="equipment-slot"
                  :class="{ 'red-slot': item.colorId === 6 }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <n-button @click="showHeroModal = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import {
  useMessage,
  NDatePicker,
  NCheckboxGroup,
  NCheckbox,
  NModal,
  NAvatar,
  NInput,
  NInputNumber,
  NSelect,
} from "naive-ui";
import { useTokenStore } from "@/stores/tokenStore";
import html2canvas from "html2canvas";
import { downloadCanvasAsImage } from "@/utils/imageExport";
import {
  Trophy,
  Refresh,
  Copy,
  ChevronDown,
  ChevronUp,
  DocumentText,
  CreateOutline,
} from "@vicons/ionicons5";
import {
  getLastSaturday,
  formatTimestamp,
  formatTimestamp1,
  parseBattleResult,
  parseAttackType,
  formatBattleRecordsForExport,
  copyToClipboard,
} from "@/utils/clubBattleUtils";
import {
  gettoday,
  formatWarrankRecordsForExport,
  allianceincludes,
} from "@/utils/clubWarrankUtils";
import { HERO_DICT, HeroFillInfo, legacycolor } from "@/utils/HeroList";

const ScoreShow = ref(1);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

const exportmethod = ref(["2"]);
const exportDom = ref(null);
const emit = defineEmits(["update:visible"]);

const message = useMessage();
const tokenStore = useTokenStore();

const showModal = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loading1 = ref(false);
const battleRecords1 = ref(null);
const expandedMembers = ref(new Set());
const queryDate = ref("");
const inputDate1 = ref(getLastSaturday());

// 新增联盟筛选功能
const activeAlliance = ref("all");
// 排序模式：manual-手动/默认，redQuench-红淬，score-积分
const currentSortType = ref("manual");

// 手动调整功能
const isEditMode = ref(false);
const manualRankings = ref({});
const manualAlliances = ref({});
const editingSortOrder = ref([]); // 编辑模式下的固定排序顺序
const tempOldRanks = ref({}); // 暂存编辑前的排名

const allianceOptions = [
  { label: "大联盟", value: "大联盟" },
  { label: "梦盟", value: "梦盟" },
  { label: "正义联盟", value: "正义联盟" },
  { label: "龙盟", value: "龙盟" },
  { label: "未知联盟", value: "未知联盟" },
];

const toggleEditMode = () => {
  if (!isEditMode.value) {
    // 进入编辑模式
    if (battleRecords1.value?.legionRankList) {
      // 1. 初始化手动数据（如果未初始化）
      battleRecords1.value.legionRankList.forEach((member) => {
        if (manualRankings.value[member.id] === undefined) {
          manualRankings.value[member.id] = redQuenchRankings.value[member.id];
        }
        if (manualAlliances.value[member.id] === undefined) {
          manualAlliances.value[member.id] =
            allianceincludes(member.announcement) || "未知联盟";
        }
      });

      // 2. 锁定当前排序顺序
      // 获取当前完整列表并按当前规则排序
      const currentList = [...battleRecords1.value.legionRankList].sort(
        (a, b) => {
          if (currentSortType.value === "manual") {
            return getMemberRank(a) - getMemberRank(b);
          } else if (currentSortType.value === "redQuench") {
            return (b.redQuench || 0) - (a.redQuench || 0);
          } else if (currentSortType.value === "score") {
            return (b.sRScore || 0) - (a.sRScore || 0);
          }
          return 0;
        },
      );
      // 保存 ID 顺序
      editingSortOrder.value = currentList.map((m) => m.id);
    }
  } else {
    // 退出编辑模式
    // 可以在这里执行额外的清理或确认逻辑
    message.success("已保存调整");
    // 强制刷新列表排序（通过 filteredLegionList 的响应式依赖）
  }
  isEditMode.value = !isEditMode.value;
};

const handleRankFocus = (member) => {
  tempOldRanks.value[member.id] = manualRankings.value[member.id];
};

const handleRankBlur = (member) => {
  const newRank = manualRankings.value[member.id];
  const oldRank = tempOldRanks.value[member.id];

  // 清理暂存
  delete tempOldRanks.value[member.id];

  // 验证有效性，如果无效则恢复
  if (!newRank || newRank < 1 || newRank > 20) {
    manualRankings.value[member.id] = oldRank;
    if (newRank !== null && newRank !== undefined) {
      // 只有当用户输入了无效值时才提示，清空不提示（虽然 NInputNumber min=1 通常不会清空）
      message.warning("排名必须在 1-20 之间");
    }
    return;
  }

  if (newRank === oldRank) return;

  // 查找占用新排名的俱乐部
  const targetMemberId = Object.keys(manualRankings.value).find(
    (id) => String(id) !== String(member.id) && manualRankings.value[id] === newRank
  );

  if (targetMemberId) {
    // 交换排名: 把占用者的排名设为我的旧排名
    manualRankings.value[targetMemberId] = oldRank;
    const targetName = getMemberName(targetMemberId);
    message.success(`排名已交换：${member.name} ↔ ${targetName}`);
  }

  // 只要手动调整了排名，就切换回 manual 排序模式
  currentSortType.value = "manual";
};

// 获取成员名称辅助函数
const getMemberName = (id) => {
  const member = battleRecords1.value?.legionRankList.find(
    (m) => String(m.id) === String(id)
  );
  return member ? member.name : "未知俱乐部";
};

const getMemberAlliance = (member) => {
  if (manualAlliances.value[member.id] !== undefined) {
    return manualAlliances.value[member.id];
  }
  return allianceincludes(member.announcement) || "未知联盟";
};

const getMemberRank = (member) => {
  if (manualRankings.value[member.id] !== undefined) {
    return manualRankings.value[member.id];
  }
  return redQuenchRankings.value[member.id];
};

// 新增查询对手相关状态
const queryLoading = ref(false);
const queryTargetId = ref("");
// 玩家信息模态框状态
const showPlayerInfoModal = ref(false);
const playerInfo = ref(null);

// 新增切磋次数相关状态
const fightCount = ref(1);
const isFightCountValid = ref(true);

// 切磋进度状态
const fightProgress = reactive({
  visible: false,
  totalCount: 0,
  completedCount: 0,
  remainingCount: 0,
  winCount: 0,
  lossCount: 0,
  percentage: 0,
});

// 最终结果状态
const fightResult = reactive({
  visible: false,
  totalCount: 0,
  winCount: 0,
  lossCount: 0,
  winRate: 0,
  ourDieRate: 0,
  enemyDieRate: 0,
  resultCount: [], // 存储每场战斗的详细结果
});

// 切磋历史记录
const fightHistory = ref([]);

// 掉将统计
const dieStats = reactive({
  ourDieHeroGameCount: 0,
  enemyDieHeroGameCount: 0,
});

// 武将详情模态框状态
const showHeroModal = ref(false);
// 选中的武将信息
const heroModealTemp = ref(null);

// 选择武将信息，显示详情模态框
const selectHeroInfo = (heroInfo) => {
  showHeroModal.value = true;
  heroModealTemp.value = heroInfo;
};

// 获取装备信息红数和孔数
const getEquipment = (equipment) => {
  let redCount = 0;
  let holeCount = 0;
  //遍历4件装备
  Object.values(equipment).forEach((equ) => {
    //遍历每件装备的属性
    Object.values(equ.quenches).forEach((item) => {
      holeCount++;
      if (item.colorId == 6) {
        redCount++;
      }
    });
  });
  return { redCount, holeCount };
};

// 提取英雄信息
const getHeroInfo = (heroObj) => {
  //统计总红数
  let redCount = 0;
  let holeCount = 0;
  let heroList = [];

  try {
    // 检查英雄数据结构，确保可以遍历
    let heroesToProcess = [];

    if (Array.isArray(heroObj)) {
      // 如果是数组，直接使用
      heroesToProcess = heroObj;
    } else if (typeof heroObj === "object" && heroObj !== null) {
      // 如果是对象，转换为数组
      heroesToProcess = Object.values(heroObj);
    } else {
      console.error("英雄数据格式错误:", typeof heroObj);
      return { redCount, holeCount, heroList };
    }

    console.log("待处理的英雄数量:", heroesToProcess.length);

    heroesToProcess.forEach((hero, index) => {
      console.log(`处理第 ${index + 1} 个英雄:`, hero);

      // 跳过无效英雄数据
      if (!hero) return;

      let heroInfo = HERO_DICT[hero.heroId] || {};
      let equipmentInfo = hero.equipment
        ? getEquipment(hero.equipment)
        : { redCount: 0, holeCount: 0 };

      // 检查英雄基本信息
      const heroId = hero.heroId || `unknown_${index}`;
      const heroName = hero.heroName || heroInfo.name || `未知武将_${index}`;

      let tempObj = {
        heroId: heroId, //英雄ID
        artifactId: hero.artifactId || "", //英雄装备ID，用于匹配鱼灵信息
        power: hero.power || 0, //英雄战力
        star: hero.star || 0, //英雄星级
        equipment: hero.equipment, //英雄具体孔数和红数
        heroName: heroName, //英雄姓名
        heroAvate: hero.heroAvate || heroInfo.avatar || "",
        level: hero.level || 0, //英雄等级
        hole: equipmentInfo.holeCount, //英雄开孔数量
        red: equipmentInfo.redCount, //英雄红数
        HolyBeast: hero.hB?.active === true, //激活四圣
        HBlevel: hero.hB?.order || 0, //四圣等级
        // 添加英雄详情信息
        skillList: hero.skillList || [],
        attributeList: hero.attributeList || [],
        battleTeamSlot: hero.battleTeamSlot, //阵容站位
      };

      // 只添加有效的英雄
      if (heroId && heroName) {
        redCount += tempObj.red;
        holeCount += tempObj.hole;
        heroList.push(tempObj);
        console.log(
          `添加英雄: ${tempObj.heroName}, 战力: ${tempObj.power}, 红数: ${tempObj.red}, 开孔数: ${tempObj.hole}`,
        );
      }
    });

    console.log("处理完成的英雄列表:", heroList);
  } catch (error) {
    console.error("处理英雄信息时发生错误:", error);
    heroList = [];
  }
  heroList.sort((a, b) => a.battleTeamSlot - b.battleTeamSlot);
  return { redCount, holeCount, heroList };
};

// 新增查询对手信息功能
const fetchTargetInfo = async (roleId) => {
  if (!tokenStore.selectedToken) {
    message.warning("请先选择游戏角色");
    return;
  }

  const tokenId = tokenStore.selectedToken.id;

  // 检查WebSocket连接
  const wsStatus = tokenStore.getWebSocketStatus(tokenId);
  if (wsStatus !== "connected") {
    message.error("WebSocket未连接，无法查询战绩");
    return;
  }

  // 重置之前的切磋结果
  resetFightResult();

  queryLoading.value = true;
  queryTargetId.value = roleId;

  try {
    const result = await tokenStore.sendMessageWithPromise(
      tokenId,
      "rank_getroleinfo",
      {
        bottleType: 0,
        includeBottleTeam: false,
        isSearch: false,
        roleId: roleId,
        includeHero: true,
        includeHeroDetail: true,
        includePearl: true,
      },
      5000,
    );

    // 调试信息
    console.log("rank_getroleinfo API返回结果:", result);

    if (!result.roleInfo) {
      message.warning("未查询到对手信息");
      console.log("未查询到roleInfo");
      return;
    }

    // 构建玩家信息对象
    console.log("构建玩家信息 - result.roleInfo:", result.roleInfo);
    console.log(
      "构建玩家信息 - result.roleInfo.heroes:",
      result.roleInfo.heroes,
    );
    console.log("构建玩家信息 - result.legionInfo:", result.legionInfo);

    // 检查英雄数据类型和结构
    console.log("英雄数据类型:", typeof result.roleInfo.heroes);
    if (result.roleInfo.heroes) {
      console.log("英雄数据是否为数组:", Array.isArray(result.roleInfo.heroes));
      console.log(
        "英雄数据是否为对象:",
        typeof result.roleInfo.heroes === "object",
      );
      console.log("英雄数据键名:", Object.keys(result.roleInfo.heroes));
    }

    // 处理鱼灵信息
    const fishInfo = HeroFillInfo(result.roleInfo);
    console.log("处理后的鱼灵信息:", fishInfo);

    // 获取英雄信息
    let heroAndholdAndRed = { redCount: 0, holeCount: 0, heroList: [] };
    if (result.roleInfo.heroes) {
      try {
        heroAndholdAndRed = getHeroInfo(result.roleInfo.heroes);
        console.log("处理后的英雄信息:", heroAndholdAndRed);
      } catch (error) {
        console.error("处理英雄信息失败:", error);
        heroAndholdAndRed = { redCount: 0, holeCount: 0, heroList: [] };
      }
    }

    // 将鱼灵信息添加到英雄列表中
    heroAndholdAndRed.heroList.forEach((hero) => {
      hero.PearlInfo = fishInfo[hero.artifactId] || {};
    });

    // 调试英雄列表
    console.log("最终英雄列表:", heroAndholdAndRed.heroList);
    console.log("英雄列表长度:", heroAndholdAndRed.heroList.length);

    // 计算总红数和总开孔数
    const totalRedCount = heroAndholdAndRed.redCount;
    const totalHoleCount = heroAndholdAndRed.holeCount;

    // 从角色信息中获取红淬数据
    const roleRedQuench = result.roleInfo.red || 0;
    const roleMaxRed = result.roleInfo.maxRed || 0;

    // 从俱乐部信息中获取红淬数据（如果有）
    const legionRedQuench =
      result.legionInfo?.statistics?.["battle:red:quench"] || roleRedQuench;
    const legionMaxRed =
      result.legionInfo?.statistics?.["red:quench"] || roleMaxRed;
    const legionMaxPower =
      result.legionInfo?.statistics?.["max:power"] ||
      result.roleInfo.maxPower ||
      0;

    const playerData = {
      id: roleId,
      name: result.roleInfo.name,
      headImg: result.roleInfo.headImg,
      power: result.roleInfo.power,
      level: result.roleInfo.level,
      serverName: result.roleInfo.serverName,
      legionName: result.legionInfo?.name || "无",
      // 显示角色的红淬数
      redQuench: roleRedQuench,
      // 四圣数统计
      holyBeast: heroAndholdAndRed.heroList.filter((hero) => hero.HolyBeast)
        .length,
      // 俱乐部历史最高战力
      maxPower: formatPower(legionMaxPower),
      // 当前红鼓和最大红鼓
      currentRedDrum: roleRedQuench,
      maxRedDrum: roleMaxRed,
      // 总红数和总开孔数
      totalRedCount: totalRedCount,
      totalHoleCount: totalHoleCount,
      // 俱乐部红淬数据
      legionRedQuench: legionRedQuench,
      legionMaxRed: legionMaxRed,
      // 英雄列表
      heroList: heroAndholdAndRed.heroList,
      legacy: result.roleInfo.legacy?.color || 0, // 功法等级
    };

    console.log("构建完成的玩家数据:", playerData);

    // 更新状态并显示模态框
    playerInfo.value = playerData;
    console.log("设置playerInfo后的值:", playerInfo.value);

    showPlayerInfoModal.value = true;
    console.log("设置showPlayerInfoModal后的值:", showPlayerInfoModal.value);

    message.success("查询成功");
  } catch (error) {
    message.error(`查询失败: ${error.message}`);
    console.error("查询失败详细信息:", error);
  } finally {
    queryLoading.value = false;
  }
};

// 车头头像点击处理
const handleHeroClick = (hero) => {
  if (hero.id && !queryLoading.value) {
    message.info(`正在查询车头信息: ${hero.name}`);
    fetchTargetInfo(hero.id);
  } else if (!hero.id) {
    message.error("车头ID不存在，无法查询信息");
    console.error("车头ID不存在", hero);
  }
};

// 验证切磋次数
const validateFightCount = (value) => {
  const num = parseInt(value);
  isFightCountValid.value = !isNaN(num) && num >= 1 && num <= 100;
};

// 重置切磋结果
const resetFightResult = () => {
  fightResult.visible = false;
  fightProgress.visible = false;
  fightHistory.value = [];
  dieStats.ourDieHeroGameCount = 0;
  dieStats.enemyDieHeroGameCount = 0;
  fightCount.value = 1;
  validateFightCount(1);
};

// 更新切磋进度
const updateFightProgress = (completedCount, winCount, lossCount) => {
  fightProgress.completedCount = completedCount;
  fightProgress.winCount = winCount;
  fightProgress.lossCount = lossCount;
  fightProgress.remainingCount = fightProgress.totalCount - completedCount;
  fightProgress.percentage = Math.round(
    (completedCount / fightProgress.totalCount) * 100,
  );
};

// 计算最终结果
const calculateFinalResult = (winCount, lossCount, resultCount) => {
  fightResult.totalCount = fightProgress.totalCount;
  fightResult.winCount = winCount;
  fightResult.lossCount = lossCount;
  fightResult.winRate = Math.round((winCount / fightProgress.totalCount) * 100);
  fightResult.ourDieRate = Math.round(
    (dieStats.ourDieHeroGameCount / fightProgress.totalCount) * 100,
  );
  fightResult.enemyDieRate = Math.round(
    (dieStats.enemyDieHeroGameCount / fightProgress.totalCount) * 100,
  );
  fightResult.resultCount = resultCount; // 存储每场战斗的详细结果
  fightResult.visible = true;
  fightProgress.visible = false;
};

// 切磋功能处理 - 支持连续切磋
const handleDuel = async () => {
  if (!playerInfo.value) return;

  // 验证切磋次数
  validateFightCount(fightCount.value);
  if (!isFightCountValid.value) {
    message.error("请输入有效的切磋次数 (1-100)");
    return;
  }

  const totalCount = parseInt(fightCount.value);
  message.info(`开始连续切磋: ${playerInfo.value.name}，共${totalCount}次`);

  if (!tokenStore.selectedToken) {
    message.warning("请先选择游戏角色");
    return;
  }

  const tokenId = tokenStore.selectedToken.id;

  // 检查WebSocket连接
  const wsStatus = tokenStore.getWebSocketStatus(tokenId);
  if (wsStatus !== "connected") {
    message.error("WebSocket未连接，无法发起切磋");
    return;
  }

  queryLoading.value = true;

  // 初始化切磋进度
  fightProgress.visible = true;
  fightProgress.totalCount = totalCount;
  fightProgress.completedCount = 0;
  fightProgress.remainingCount = totalCount;
  fightProgress.winCount = 0;
  fightProgress.lossCount = 0;
  fightProgress.percentage = 0;

  // 重置掉将统计
  dieStats.ourDieHeroGameCount = 0;
  dieStats.enemyDieHeroGameCount = 0;

  // 重置历史记录
  fightHistory.value = [];

  try {
    let winCount = 0;
    let lossCount = 0;
    let resultCount = []; // 存储每场战斗的详细结果

    // 重置掉将统计
    dieStats.ourDieHeroGameCount = 0;
    dieStats.enemyDieHeroGameCount = 0;

    // 执行连续切磋
    for (let i = 0; i < totalCount; i++) {
      message.info(`正在进行第 ${i + 1}/${totalCount} 场切磋`);

      // 调用实际的切磋API
      const result = await tokenStore.sendMessageWithPromise(
        tokenId,
        "fight_startpvp",
        {
          targetId: playerInfo.value.id,
        },
        10000,
      );

      console.log(`第 ${i + 1} 场切磋结果:`, result);

      if (result && result.battleData) {
        // 处理掉将情况
        let leftCount = 0;
        let rightCount = 0;

        // 检查我方掉将情况
        if (result.battleData.result?.sponsor?.teamInfo) {
          result.battleData.result.sponsor.teamInfo.forEach((item) => {
            if (item.hp == 0) {
              leftCount++;
            }
          });
        }

        // 检查敌方掉将情况
        if (result.battleData.result?.accept?.teamInfo) {
          result.battleData.result.accept.teamInfo.forEach((item) => {
            if (item.hp == 0) {
              rightCount++;
            }
          });
        }

        // 构建战斗结果对象
        const battleResult = {
          isWin: result.battleData.result?.isWin || false,
          leftName: result.battleData.leftTeam?.name || "未知",
          leftheadImg: result.battleData.leftTeam?.headImg || "",
          leftpower: formatPower(result.battleData.leftTeam?.power || 0),
          leftDieHero: leftCount,
          rightName: result.battleData.rightTeam?.name || "未知",
          rightheadImg: result.battleData.rightTeam?.headImg || "",
          rightpower: formatPower(result.battleData.rightTeam?.power || 0),
          rightDieHero: rightCount,
        };

        // 保存到结果数组
        resultCount.push(battleResult);

        // 更新掉将统计
        if (leftCount > 0) {
          dieStats.ourDieHeroGameCount++;
        }
        if (rightCount > 0) {
          dieStats.enemyDieHeroGameCount++;
        }

        // 更新胜负计数
        if (battleResult.isWin) {
          winCount++;
        } else {
          lossCount++;
        }

        // 更新切磋进度
        updateFightProgress(i + 1, winCount, lossCount);

        // 短暂延迟，避免请求过于频繁
        if (i < totalCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        // 单场切磋失败，继续下一场
        message.warning(
          `第 ${i + 1} 场切磋失败: ${result?.message || "未返回战斗数据"}`,
        );
        lossCount++;
        updateFightProgress(i + 1, winCount, lossCount);
      }
    }

    // 所有切磋完成，计算最终结果
    calculateFinalResult(winCount, lossCount, resultCount);

    message.success(`连续切磋完成，共${totalCount}场`);
  } catch (error) {
    console.error("连续切磋失败:", error);
    message.error(`连续切磋失败: ${error.message || "网络错误"}`);
    fightProgress.visible = false;
  } finally {
    queryLoading.value = false;
    // 不关闭模态框，让用户可以继续查看或再次切磋
  }
};

// 联盟筛选计算属性
const filteredLegionList = computed(() => {
  if (!battleRecords1.value?.legionRankList) {
    return [];
  }

  if (activeAlliance.value === "all") {
    return [...battleRecords1.value.legionRankList].sort((a, b) => {
      if (isEditMode.value) {
        // 编辑模式下，按照快照顺序排序
        return (
          editingSortOrder.value.indexOf(a.id) -
          editingSortOrder.value.indexOf(b.id)
        );
      }
      if (currentSortType.value === "manual") {
        return getMemberRank(a) - getMemberRank(b);
      } else if (currentSortType.value === "redQuench") {
        return (b.redQuench || 0) - (a.redQuench || 0);
      } else if (currentSortType.value === "score") {
        return (b.sRScore || 0) - (a.sRScore || 0);
      }
      return 0;
    });
  }

  const filtered = battleRecords1.value.legionRankList.filter((member) => {
    const memberAlliance = getMemberAlliance(member);
    if (activeAlliance.value === "空白") {
      return (
        !member.announcement ||
        member.announcement === 0 ||
        member.announcement === "0"
      );
    }
    return memberAlliance === activeAlliance.value;
  });

  return filtered.sort((a, b) => {
    if (isEditMode.value) {
      // 编辑模式下，按照快照顺序排序
      return (
        editingSortOrder.value.indexOf(a.id) -
        editingSortOrder.value.indexOf(b.id)
      );
    }
    if (currentSortType.value === "manual") {
      return getMemberRank(a) - getMemberRank(b);
    } else if (currentSortType.value === "redQuench") {
      return (b.redQuench || 0) - (a.redQuench || 0);
    } else if (currentSortType.value === "score") {
      return (b.sRScore || 0) - (a.sRScore || 0);
    }
    return 0;
  });
});

// 计算所有俱乐部的红淬排名
const redQuenchRankings = computed(() => {
  if (!battleRecords1.value?.legionRankList) return {};

  // 按红淬数量降序排序所有俱乐部，获取真实排名
  const sortedByRedQuench = [...battleRecords1.value.legionRankList].sort(
    (a, b) => (b.redQuench || 0) - (a.redQuench || 0),
  );

  // 创建俱乐部ID到红淬排名的映射（1-based）
  const rankMap = {};
  sortedByRedQuench.forEach((club, index) => {
    rankMap[club.id] = index + 1;
  });

  return rankMap;
});

// 设置当前选中联盟
const setActiveAlliance = (alliance) => {
  activeAlliance.value = alliance;
};

// 获取联盟数量
const getActiveAllianceCount = (alliance) => {
  if (!battleRecords1.value?.legionRankList) {
    return 0;
  }

  return battleRecords1.value.legionRankList.filter((member) => {
    const memberAlliance = getMemberAlliance(member);
    if (alliance === "空白") {
      return (
        !member.announcement ||
        member.announcement === 0 ||
        member.announcement === "0"
      );
    }
    return memberAlliance === alliance;
  }).length;
};

// 格式化战力
const formatPower = (power) => {
  if (!power) return "0";
  if (power >= 100000000) {
    return (power / 100000000).toFixed(2) + "亿";
  }
  if (power >= 10000) {
    return (power / 10000).toFixed(2) + "万";
  }
  return power.toString();
};

const formatScore = (Score) => {
  return Score ? Score.toFixed(0).toString() : "0";
};

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = "none";
};

const disabledDate = (current) => {
  return (
    (current.getDay() != 6 && current.getDay() != 0) || current > Date.now()
  );
};

// 联盟样式类
const getAllianceClass = (alliance) => {
  switch (alliance) {
    case "大联盟":
      return "alliance-large";
    case "梦盟":
      return "alliance-dream";
    case "正义联盟":
      return "alliance-xin-justice";
    case "龙盟":
      return "alliance-dragon";
    case "未知联盟":
      return "alliance-unknown";
    default:
      return "alliance-other";
  }
};

// 红淬样式类
const getRedQuenchClass = (redQuench) => {
  if (redQuench >= 60) {
    return "redquench-high";
  } else if (redQuench >= 50) {
    return "redquench-medium";
  } else {
    return "redquench-low";
  }
};

//日期选择时调用查询战绩方法
const fetchBattleRecordsByDate = (val) => {
  if (undefined != val) {
    inputDate1.value = val;
  } else {
    inputDate1.value = getLastSaturday();
  }
  fetchBattleRecords1();
};

// 查询战绩
const fetchBattleRecords1 = async () => {
  if (!tokenStore.selectedToken) {
    message.warning("请先选择游戏角色");
    return;
  }

  const tokenId = tokenStore.selectedToken.id;

  // 检查WebSocket连接
  const wsStatus = tokenStore.getWebSocketStatus(tokenId);
  if (wsStatus !== "connected") {
    message.error("WebSocket未连接，无法查询战绩");
    return;
  }

  loading1.value = true;
  queryDate.value = formatTimestamp1(inputDate1.value);

  if (gettoday() == queryDate.value && new Date().getHours() < 21) {
    const getbattlefield = await tokenStore.sendMessageWithPromise(
      tokenId,
      "legion_getbattlefield",
      {},
      10000,
    );
    if (!getbattlefield.info) {
      battleRecords1.value = null;
      message.warning("未查询到盐场匹配数据");
      return;
    }
    try {
      const result = await tokenStore.sendMessageWithPromise(
        tokenId,
        "legion_getopponent",
        {
          phase: getbattlefield.info.phase,
          battlefieldId: getbattlefield.info.battlefieldId,
        },
        10000,
      );

      if (!result?.opponentList) {
        battleRecords1.value = null;
        message.warning("未查询到盐场匹配数据");
        return;
      }
      ScoreShow.value = 1;
      const detailPromises = result.opponentList.map(async (club) => {
        try {
          const detail = await tokenStore.sendMessageWithPromise(
            tokenId,
            "legion_getinfobyid",
            { legionId: club.id },
            5000,
          );
          if (!detail) {
            return {
              ...club,
              redQuench: 0,
              power: 0,
              announcement: "未知",
              redno: 0,
              redno1: "0红",
              redno2: "0红",
              redno3: "0红",
              hb1: 0,
              hb2: 0,
              hb3: 0,
              topHeroes: [],
              level: 30,
            };
          }
          const topHeroes = [];

          for (const [roleId, memberData] of Object.entries(
            detail?.legionData?.members,
          )) {
            const tempRoleInfo = await tokenStore.sendMessageWithPromise(
              tokenId,
              "rank_getroleinfo",
              {
                bottleType: 0,
                includeBottleTeam: false,
                isSearch: false,
                roleId: roleId,
              },
              5000,
            );

            let holyBeast = 0;
            for (const [heroId, heroData] of Object.entries(
              tempRoleInfo?.roleInfo?.heroes,
            )) {
              if (heroData.hB?.active !== undefined) {
                holyBeast++;
              }
            }

            topHeroes.push({
              id: roleId,
              name: memberData.name || memberData.custom?.name || "未知",
              headImg: memberData.headImg || memberData.custom?.headImg || "",
              power: tempRoleInfo?.roleInfo?.power || 0,
              redQuench: memberData.custom?.red_quench_cnt || 0,
              holyBeast: holyBeast,
            });
          }

          // 按红淬数量降序排序，取前三
          topHeroes.sort((a, b) => b.redQuench - a.redQuench);
          const top3Heroes = topHeroes.slice(0, 3);

          // 提取红淬数量数组
          const redQuenchCounts = top3Heroes.map(
            (hero) => hero.redQuench + "红",
          );
          // 提取圣物数量数组
          const HolyBeastNum = top3Heroes.map((hero) => hero.holyBeast);

          return {
            ...club,
            redQuench: detail?.legionData?.quenchNum || 0,
            power: detail?.legionData?.power || 0,
            announcement: detail?.legionData?.announcement || 0,
            redno: redQuenchCounts || 0,
            redno1: redQuenchCounts[0] || "0红",
            redno2: redQuenchCounts[1] || "0红",
            redno3: redQuenchCounts[2] || "0红",
            hb1: HolyBeastNum[0] || 0,
            hb2: HolyBeastNum[1] || 0,
            hb3: HolyBeastNum[2] || 0,
            topHeroes: top3Heroes,
            level: 30,
          };
        } catch (error) {
          console.error(`查询俱乐部${club.id}详情失败:`, error);
          return {
            ...club,
            redQuench: 0,
            power: 0,
            announcement: "未知",
            redno: 0,
            redno1: "0红",
            redno2: "0红",
            redno3: "0红",
            hb1: 0,
            hb2: 0,
            hb3: 0,
            topHeroes: [],
            level: 30,
          };
        }
      });
      const processedClubs = await Promise.all(detailPromises);

      // 1. 为每个俱乐部添加联盟信息
      const clubsWithAlliance = processedClubs.map((club) => ({
        ...club,
        alliance: allianceincludes(club.announcement),
      }));

      // 2. 统计每个联盟的俱乐部数量
      const allianceStats = {};
      clubsWithAlliance.forEach((club) => {
        const alliance = club.alliance;
        allianceStats[alliance] = (allianceStats[alliance] || 0) + 1;
      });

      // 3. 找出联盟数量最多的联盟
      let maxAlliance = "";
      let maxCount = 0;
      for (const [alliance, count] of Object.entries(allianceStats)) {
        if (count > maxCount) {
          maxCount = count;
          maxAlliance = alliance;
        }
      }

      // 4. 按照联盟分组，并优先显示数量最多的联盟
      // 先将所有俱乐部按联盟分组
      const allianceGroups = {};
      clubsWithAlliance.forEach((club) => {
        const alliance = club.alliance;
        if (!allianceGroups[alliance]) {
          allianceGroups[alliance] = [];
        }
        allianceGroups[alliance].push(club);
      });

      // 5. 在每个联盟内部按照红粹数从高到低排序
      for (const alliance in allianceGroups) {
        allianceGroups[alliance].sort(
          (a, b) => (b.redQuench || 0) - (a.redQuench || 0),
        );
      }

      // 6. 构建最终排序后的列表：先显示最大联盟，然后按联盟名称排序
      const sortedLegionList = [];

      // 先添加最大联盟的俱乐部
      if (maxAlliance && allianceGroups[maxAlliance]) {
        sortedLegionList.push(...allianceGroups[maxAlliance]);
        delete allianceGroups[maxAlliance];
      }

      // 然后添加其他联盟的俱乐部，按联盟名称排序
      const otherAlliances = Object.keys(allianceGroups).sort();
      for (const alliance of otherAlliances) {
        sortedLegionList.push(...allianceGroups[alliance]);
      }

      battleRecords1.value = {
        ...result,
        legionRankList: sortedLegionList,
      };
      message.success("盐场匹配数据加载成功");
    } catch (error) {
      console.error("查询失败:", error);
      message.error(`查询失败: ${error.message}`);
      battleRecords1.value = null;
    } finally {
      loading1.value = false;
    }
  } else {
    try {
      const result = await tokenStore.sendMessageWithPromise(
        tokenId,
        "legion_getwarrank",
        { date: queryDate.value },
        10000,
      );

      if (!result?.legionRankList) {
        battleRecords1.value = null;
        message.warning("未查询到盐场匹配数据");
        return;
      }
      ScoreShow.value = 0;
      const detailPromises = result.legionRankList.map(async (club) => {
        try {
          const detail = await tokenStore.sendMessageWithPromise(
            tokenId,
            "legion_getinfobyid",
            { legionId: club.id },
            5000,
          );
          club.sRScore = -1;
          if (!detail) {
            return {
              ...club,
              redQuench: 0,
              power: 0,
              announcement: "未知",
              redno: 0,
              redno1: "0红",
              redno2: "0红",
              redno3: "0红",
              hb1: 0,
              hb2: 0,
              hb3: 0,
              topHeroes: [],
              level: 30,
            };
          }
          const topHeroes = [];

          for (const [roleId, memberData] of Object.entries(
            detail?.legionData?.members,
          )) {
            const tempRoleInfo = await tokenStore.sendMessageWithPromise(
              tokenId,
              "rank_getroleinfo",
              {
                bottleType: 0,
                includeBottleTeam: false,
                isSearch: false,
                roleId: roleId,
              },
              5000,
            );

            let holyBeast = 0;
            for (const [heroId, heroData] of Object.entries(
              tempRoleInfo?.roleInfo?.heroes,
            )) {
              if (heroData.hB?.active !== undefined) {
                holyBeast++;
              }
            }

            topHeroes.push({
              id: roleId,
              name: memberData.name || memberData.custom?.name || "未知",
              headImg: memberData.headImg || memberData.custom?.headImg || "",
              power: tempRoleInfo?.roleInfo?.power || 0,
              redQuench: memberData.custom?.red_quench_cnt || 0,
              holyBeast: holyBeast,
            });
          }

          // 按红淬数量降序排序，取前三
          topHeroes.sort((a, b) => b.redQuench - a.redQuench);
          const top3Heroes = topHeroes.slice(0, 3);

          // 提取红淬数量数组
          const redQuenchCounts = top3Heroes.map(
            (hero) => hero.redQuench + "红",
          );
          // 提取圣物数量数组
          const HolyBeastNum = top3Heroes.map((hero) => hero.holyBeast);

          return {
            ...club,
            redQuench: detail?.legionData?.quenchNum || 0,
            power: detail?.legionData?.power || 0,
            announcement: detail?.legionData?.announcement || 0,
            redno: redQuenchCounts || 0,
            redno1: redQuenchCounts[0] || "0红",
            redno2: redQuenchCounts[1] || "0红",
            redno3: redQuenchCounts[2] || "0红",
            hb1: HolyBeastNum[0] || 0,
            hb2: HolyBeastNum[1] || 0,
            hb3: HolyBeastNum[2] || 0,
            topHeroes: top3Heroes,
            level: 30,
          };
        } catch (error) {
          console.error(`查询俱乐部${club.id}详情失败:`, error);
          return {
            ...club,
            redQuench: 0,
            power: 0,
            announcement: "未知",
            redno: 0,
            redno1: "0红",
            redno2: "0红",
            redno3: "0红",
            hb1: 0,
            hb2: 0,
            hb3: 0,
            topHeroes: [],
            level: 30,
          };
        }
      });
      const processedClubs = await Promise.all(detailPromises);

      // 1. 为每个俱乐部添加联盟信息
      const clubsWithAlliance = processedClubs.map((club) => ({
        ...club,
        alliance: allianceincludes(club.announcement),
      }));

      // 2. 统计每个联盟的俱乐部数量
      const allianceStats = {};
      clubsWithAlliance.forEach((club) => {
        const alliance = club.alliance;
        allianceStats[alliance] = (allianceStats[alliance] || 0) + 1;
      });

      // 3. 找出联盟数量最多的联盟
      let maxAlliance = "";
      let maxCount = 0;
      for (const [alliance, count] of Object.entries(allianceStats)) {
        if (count > maxCount) {
          maxCount = count;
          maxAlliance = alliance;
        }
      }

      // 4. 按照联盟分组，并优先显示数量最多的联盟
      // 先将所有俱乐部按联盟分组
      const allianceGroups = {};
      clubsWithAlliance.forEach((club) => {
        const alliance = club.alliance;
        if (!allianceGroups[alliance]) {
          allianceGroups[alliance] = [];
        }
        allianceGroups[alliance].push(club);
      });

      // 5. 在每个联盟内部按照红粹数从高到低排序
      for (const alliance in allianceGroups) {
        allianceGroups[alliance].sort(
          (a, b) => (b.redQuench || 0) - (a.redQuench || 0),
        );
      }

      // 6. 构建最终排序后的列表：先显示最大联盟，然后按联盟名称排序
      const sortedLegionList = [];

      // 先添加最大联盟的俱乐部
      if (maxAlliance && allianceGroups[maxAlliance]) {
        sortedLegionList.push(...allianceGroups[maxAlliance]);
        delete allianceGroups[maxAlliance];
      }

      // 然后添加其他联盟的俱乐部，按联盟名称排序
      const otherAlliances = Object.keys(allianceGroups).sort();
      for (const alliance of otherAlliances) {
        sortedLegionList.push(...allianceGroups[alliance]);
      }

      battleRecords1.value = {
        ...result,
        legionRankList: sortedLegionList,
      };
      message.success("盐场匹配数据加载成功");
    } catch (error) {
      console.error("查询失败:", error);
      message.error(`查询失败: ${error.message}`);
      battleRecords1.value = null;
    } finally {
      loading1.value = false;
    }
  }
};
// 刷新战绩
const handleRefresh1 = () => {
  fetchBattleRecords1();
};

const hcSort = async () => {
  if (!battleRecords1.value?.legionRankList) return;

  // 1. 按红淬数量排序
  const sortedList = [...battleRecords1.value.legionRankList].sort(
    (a, b) => (b.redQuench || 0) - (a.redQuench || 0),
  );

  // 2. 更新排名数据
  sortedList.forEach((member, index) => {
    manualRankings.value[member.id] = index + 1;
  });

  // 3. 切换到手动排序模式（使用更新后的排名）
  currentSortType.value = "manual";

  // 4. 如果在编辑模式，更新快照顺序以立即刷新视图
  if (isEditMode.value) {
    editingSortOrder.value = sortedList.map((m) => m.id);
  }

  message.success("已按红淬数量重置排名");
};

const scoreSort = async () => {
  if (!battleRecords1.value?.legionRankList) return;

  // 1. 按积分排序
  const sortedList = [...battleRecords1.value.legionRankList].sort(
    (a, b) => (b.sRScore || 0) - (a.sRScore || 0),
  );

  // 2. 更新排名数据
  sortedList.forEach((member, index) => {
    manualRankings.value[member.id] = index + 1;
  });

  // 3. 切换到手动排序模式（使用更新后的排名）
  currentSortType.value = "manual";

  // 4. 如果在编辑模式，更新快照顺序以立即刷新视图
  if (isEditMode.value) {
    editingSortOrder.value = sortedList.map((m) => m.id);
  }

  message.success("已按积分重置排名");
};
// 导出战绩
const handleExport1 = async () => {
  if (!battleRecords1.value || !battleRecords1.value.legionRankList) {
    message.warning("没有可导出的数据");
    return;
  }

  try {
    if (exportmethod.value.includes("1")) {
      const exportText = formatWarrankRecordsForExport(
        battleRecords1.value.legionRankList,
        queryDate.value,
      );
    }
    if (exportmethod.value.includes("2")) {
      exportToImage();
    }
    message.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    message.error("导出失败，请重试");
  }
};

const exportToImage = async () => {
  // 校验：确保DOM已正确绑定
  if (!exportDom.value) {
    alert("未找到要导出的DOM元素");
    return;
  }

  // 获取 table-container
  const tableContainer = exportDom.value.querySelector('.table-container');
  // 保存滚动位置
  const scrollTop = tableContainer ? tableContainer.scrollTop : 0;

  try {
    // 临时调整表格容器高度，确保所有内容可见
    exportDom.value.style.height = "auto";
    exportDom.value.style.overflow = "visible";

    if (tableContainer) {
      // 保存原始样式
      tableContainer.dataset.originalHeight = tableContainer.style.height;
      tableContainer.dataset.originalOverflow = tableContainer.style.overflow;
      
      tableContainer.style.height = "auto";
      tableContainer.style.overflow = "visible";
    }

    // 等待DOM更新
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 5. 用html2canvas渲染DOM为Canvas
    const canvas = await html2canvas(exportDom.value, {
      scale: 2, // 放大2倍，解决图片模糊问题
      useCORS: true, // 允许跨域图片（若DOM内有远程图片，需开启）
      backgroundColor: "#ffffff", // 避免透明背景（默认透明）
      logging: false, // 关闭控制台日志
      height: exportDom.value.scrollHeight, // 确保捕获完整高度
      width: exportDom.value.scrollWidth, // 确保捕获完整宽度
      windowWidth: exportDom.value.scrollWidth, // 设置窗口宽度
      windowHeight: exportDom.value.scrollHeight, // 设置窗口高度
      allowTaint: true, // 允许跨域图片污染画布
    });

    // 6. Canvas转图片链接并下载
    const filename = queryDate.value.replace("/", "年").replace("/", "月") + "日盐场匹配信息.png";
    downloadCanvasAsImage(canvas, filename);
  } catch (err) {
    console.error("DOM转图片失败：", err);
    alert("导出图片失败，请重试");
  } finally {
    // 恢复原始样式
    exportDom.value.style.removeProperty('height');
    exportDom.value.style.removeProperty('overflow');
    
    if (tableContainer) {
      if (tableContainer.dataset.originalHeight) {
        tableContainer.style.height = tableContainer.dataset.originalHeight;
      } else {
        tableContainer.style.removeProperty('height');
      }
      
      if (tableContainer.dataset.originalOverflow) {
        tableContainer.style.overflow = tableContainer.dataset.originalOverflow;
      } else {
        tableContainer.style.removeProperty('overflow');
      }
      
      // 清理 dataset
      delete tableContainer.dataset.originalHeight;
      delete tableContainer.dataset.originalOverflow;
      
      // 恢复滚动位置
      tableContainer.scrollTop = scrollTop;
    }
  }
};

// 关闭弹窗
const handleClose = () => {
  expandedMembers.value.clear();
};

// 暴露方法给父组件
defineExpose({
  fetchBattleRecords1,
});

// Inline 模式：挂载后自动拉取
onMounted(() => {
  fetchBattleRecords1();
});
</script>

<style scoped lang="scss">
// 模态框样式
.player-info-content {
  padding: 20px;
}

.player-info-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-light);
}

.player-avatar {
  border: 2px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-info-detail h3 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.player-info-detail p {
  margin: 0 0 4px 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.action-section {
  margin: 15px 0;
  display: flex;
  justify-content: flex-start;
}

.fight-count-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto;
}

.fight-count-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.fight-count-input {
  width: 100px;
}

.fight-count-hint {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.fight-count-error {
  font-size: var(--font-size-xs);
  color: var(--error-color);
  margin-left: 4px;
}

.fight-progress {
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.progress-stats {
  display: flex;
  gap: 15px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.fight-result {
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
}

.fight-result h4 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.result-label {
  color: var(--text-secondary);
}

.result-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.result-value.win {
  color: var(--success-color);
}

.result-value.loss {
  color: var(--error-color);
}

.result-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

/* 武将详情模态框样式 */
.hero-detail-modal {
  .hero-modal-content {
    padding: 20px 0;
  }

  .hero-modal-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .hero-modal-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid var(--border-light);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-placeholder {
      font-size: 36px;
      font-weight: var(--font-weight-bold);
      color: var(--text-secondary);
    }
  }

  .hero-modal-basic {
    flex: 1;
  }

  .hero-modal-name {
    margin: 0 0 10px 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }

  .hero-modal-stats {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);

    .stat-item {
      padding: 4px 8px;
      background: var(--bg-secondary);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-light);
    }
  }

  .hero-modal-details {
    margin-bottom: 20px;

    :deep(.n-descriptions) {
      font-size: var(--font-size-sm);

      .n-descriptions-item-label {
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
      }

      .n-descriptions-item-content {
        color: var(--text-secondary);
      }
    }
  }

  .hero-modal-equipment {
    margin-top: 20px;
  }

  .section-title {
    margin: 0 0 15px 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
  }

  .equipment-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .equipment-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .equipment-label {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
    width: 60px;
  }

  .equipment-slots {
    display: flex;
    gap: 6px;
  }

  .equipment-slot {
    width: 20px;
    height: 20px;
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-sm);
    background: var(--bg-secondary);
  }

  .equipment-slot.red-slot {
    background: var(--error-color);
    border-color: var(--error-color);
  }

  /* 鱼灵洗练颜色块 */
  .ModalEquipment {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 4px;
    display: inline-block;
    vertical-align: middle;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-detail-modal {
    :deep(.n-modal-content) {
      padding: 0 !important;
    }

    .hero-modal-header {
      flex-direction: column;
      text-align: center;
    }

    .equipment-grid {
      grid-template-columns: 1fr;
    }
  }
}

/* 切磋结果显示样式 */
.fight-result {
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.result-title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.result-summary {
  display: flex;
  gap: 15px;
  font-size: var(--font-size-sm);
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.summary-value.win {
  color: var(--success-color);
}

.summary-value.loss {
  color: var(--error-color);
}

.result-list {
  margin-bottom: 15px;
}

.battle-result-item {
  margin-bottom: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
  border-left: 4px solid var(--border-light);
  transition: all var(--transition-fast);
}

.battle-result-item.win {
  border-left-color: var(--success-color);
  background: rgba(var(--success-color-rgb), 0.03);
}

.battle-result-item.loss {
  border-left-color: var(--error-color);
  background: rgba(var(--error-color-rgb), 0.03);
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.battle-index {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.battle-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.battle-side {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.side-avatar {
  flex-shrink: 0;
}

.side-info {
  flex: 1;
  font-size: var(--font-size-sm);
}

.side-name {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 3px;
}

.side-power {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.side-die {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.battle-vs {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  margin: 0 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .result-summary {
    gap: 10px;
  }

  .battle-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .battle-side {
    width: 100%;
  }

  .battle-vs {
    align-self: center;
    margin: 5px 0;
    transform: rotate(90deg);
  }
}

.player-heroes {
  margin-top: 20px;
}

.player-heroes h4 {
  margin: 0 0 12px 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.hero-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.hero-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--primary-color);
  }
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.hero-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.hero-stats span {
  padding: 2px 6px;
  background: var(--bg-primary);
  border-radius: var(--border-radius-full);
  border: 1px solid var(--border-light);
}

.hero-stats span.opened {
  background: rgba(var(--success-color-rgb), 0.1);
  color: var(--success-color);
  border-color: var(--success-color);
}

.hero-stats span.closed {
  background: rgba(var(--warning-color-rgb), 0.1);
  color: var(--warning-color);
  border-color: var(--warning-color);
}

.empty-heroes {
  background: var(--bg-secondary);
  padding: 30px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-light);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.player-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

// 主容器样式
// 主容器样式
.club-warrank-container {
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

// 卡片样式
.club-warrank-card {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 头部信息区
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .header-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: var(--border-radius-md);
    background: var(--bg-secondary);
    padding: var(--spacing-xs);
    box-sizing: border-box;
  }

  .header-title {
    h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }

    p {
      margin: var(--spacing-xs) 0 0 0;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }

  // 数据统计区
  .stats-section {
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        font-weight: var(--font-weight-medium);
      }

      :deep(.n-tag) {
        font-size: var(--font-size-sm);
        padding: 4px 8px;
      }
    }
  }
}

// 功能操作区
.function-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;

  .function-left {
    .export-options {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      :deep(.n-checkbox-group) {
        display: flex;
        gap: var(--spacing-md);

        .n-checkbox {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }
      }
    }
  }

  .function-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    :deep(.n-date-picker) {
      font-size: var(--font-size-sm);
      width: 200px;

      .n-input-wrapper {
        font-size: var(--font-size-sm);
      }
    }

    .action-btn {
      font-size: var(--font-size-sm);
      padding: 6px 12px;
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-medium);
      }

      &.refresh-btn {
        background: var(--bg-primary);
        border: 1px solid var(--border-medium);
      }

      &.export-btn {
        background: var(--primary-color);
        color: white;

        &:hover {
          background: var(--primary-color-hover);
        }
      }

      &.sort-btn {
        background: var(--info-color-light);
        color: var(--info-color);
        border: 1px solid var(--info-color);

        &:hover {
          background: var(--info-color-hover);
          color: white;
        }
      }
    }
  }
}

// 公告区域
.announcement-section {
  background: linear-gradient(
    135deg,
    var(--primary-color-light) 0%,
    var(--primary-color) 100%
  );
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;

  .announcement-content {
    display: flex;
    justify-content: center;
    align-items: center;

    .announcement-text {
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-align: center;
      line-height: 1.5;
      max-width: 800px;
    }
  }
}

// 联盟分类标签栏
.alliance-tabs-section {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);
  flex-shrink: 0;

  .alliance-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: white;
    cursor: pointer;
    transition: all var(--transition-fast);
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }

    &.active {
      background: white;
      color: var(--primary-color);
      box-shadow: var(--shadow-medium);
      transform: translateY(-2px);
    }

    &.all {
      background: rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &.active {
        background: white;
        color: var(--primary-color);
      }
    }

    .tab-text {
      font-size: var(--font-size-sm);
    }

    .tab-count {
      font-size: var(--font-size-xs);
      background: rgba(255, 255, 255, 0.3);
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: var(--font-weight-bold);

      .alliance-tab.active & {
        background: var(--primary-color);
        color: white;
      }
    }
  }
}

// 表格内容区
.table-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);

  // 加载状态
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: var(--bg-primary);
    height: 100%;

    :deep(.n-spin) {
      font-size: var(--font-size-lg);

      .n-spin-description {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: var(--bg-primary);
    height: 100%;

    :deep(.n-empty) {
      font-size: var(--font-size-sm);

      .n-empty-description {
        color: var(--text-secondary);
      }
    }
  }

  // 表格容器
  .table-container {
    flex: 1;
    overflow: auto;
    background: var(--bg-primary);
    height: 100%;

    // 滚动条样式
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
      border-radius: var(--border-radius-sm);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-medium);
      border-radius: var(--border-radius-sm);

      &:hover {
        background: var(--border-dark);
      }
    }

    // 表格标题行
    .table-header {
      display: flex;
      background: linear-gradient(
        180deg,
        var(--bg-secondary) 0%,
        var(--bg-primary) 100%
      );
      border-bottom: 2px solid var(--border-medium);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      // 确保所有标题头居中对齐
      .table-cell {
        justify-content: center;
      }
    }

    // 表格数据行
    .table-row {
      display: flex;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-bottom: 1px solid var(--border-light);
      transition: all var(--transition-fast);
      background: var(--bg-primary);

      &:hover {
        background: var(--bg-secondary);
        transform: translateX(2px);
        box-shadow: inset 3px 0 0 var(--primary-color);
      }

      &:last-child {
        border-bottom: none;
      }

      // 联盟样式类
      &.alliance-large {
        .alliance-tag {
          background: var(--primary-color);
        }
      }

      &.alliance-dream {
        .alliance-tag {
          background: var(--success-color);
        }
      }

      &.alliance-xin-justice {
        .alliance-tag {
          background: var(--info-color);
        }
      }

      &.alliance-dragon {
        .alliance-tag {
          background: var(--error-color);
        }
      }

      &.alliance-unknown {
        .alliance-tag {
          background: var(--warning-color);
        }
      }

      &.alliance-other {
        .alliance-tag {
          background: var(--text-secondary);
        }
      }
    }

    // 表格单元格
    .table-cell {
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--text-primary);

      // 单元格宽度分配
      &.rank {
        width: 90px;
        min-width: 90px;
        justify-content: center;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        padding: 4px 8px;

        .rank-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 4px 0;
        }

        .rank-medal {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: var(--font-size-base);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          margin: 0 6px;

          &::before {
            content: attr(data-rank);
          }

          &.gold {
            background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);

            &::before {
              content: "1";
            }
          }

          &.silver {
            background: linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%);

            &::before {
              content: "2";
            }
          }

          &.bronze {
            background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);

            &::before {
              content: "3";
            }
          }
        }

        .rank-number {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0 6px;
        }
      }

      &.alliance {
        width: 80px;
        min-width: 80px;

        .alliance-tag {
          display: inline-block;
          padding: 3px 8px;
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transition: all var(--transition-fast);

          &:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-medium);
          }
        }
      }

      &.avatar {
        width: 50px;
        min-width: 50px;
        justify-content: center;

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-light);
          transition: all var(--transition-fast);

          &:hover {
            transform: scale(1.2);
            box-shadow: var(--shadow-medium);
            border-color: var(--primary-color);
          }
        }

        .member-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--primary-color-light) 100%
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-bold);
          border: 2px solid var(--border-light);
        }
      }

      &.name {
        width: 120px;
        min-width: 120px;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        font-size: var(--font-size-base);
      }

      &.score {
        width: 80px;
        min-width: 80px;
        justify-content: center;
        color: var(--warning-color);
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-base);
        text-align: center;
      }

      &.red-quench {
        width: 80px;
        min-width: 80px;
        justify-content: center;
        font-weight: var(--font-weight-bold);
        text-align: center;

        &::before {
          content: "";
          display: inline-block;
          width: 12px;
          height: 12px;
          background: var(--error-color);
          border-radius: 50%;
          margin-right: 4px;
          vertical-align: middle;
        }
      }

      &.first-3 {
        width: 350px;
        min-width: 405px;

        .hero-avatars {
          display: flex;
          gap: var(--spacing-xs);
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          flex-wrap: nowrap;
          padding: var(--spacing-xs) 0;
          overflow: hidden;
        }

        .hero-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(var(--spacing-xs) / 2);
          padding: calc(var(--spacing-xs) / 2);
          background: var(--bg-secondary);
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-light);
          transition: all var(--transition-fast);
          min-width: 120px;
          flex: 1;
          max-width: 130px;
          cursor: pointer;

          &:hover {
            background: var(--bg-primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-medium);
            border-color: var(--primary-color);
          }

          &:active {
            transform: translateY(0);
            box-shadow: var(--shadow-sm);
          }
        }

        /* 覆盖全局hero-stats span样式，确保战力和红数正常显示 */
        .hero-stats span {
          padding: 0;
          background: none;
          border: none;
          border-radius: 0;
        }

        .hero-avatar-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          cursor: pointer;
        }

        .hero-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-light);
          transition: all var(--transition-fast);
          cursor: pointer;

          &:hover {
            transform: scale(1.1);
            border-color: var(--primary-color);
          }

          &:active {
            transform: scale(0.95);
          }
        }

        .hero-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--primary-color-light) 100%
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          border: 2px solid var(--border-light);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: scale(0.95);
          }
        }

        .hero-holy-beast {
          position: absolute;
          right: -5px;
          bottom: -5px;
          display: flex;
          align-items: center;
          gap: 2px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 2px 6px;
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
          box-shadow: var(--shadow-sm);
          border: 2px solid var(--bg-primary);
          z-index: 10;

          .holy-beast-icon {
            font-size: var(--font-size-sm);
          }

          .holy-beast-count {
            font-size: var(--font-size-xs);
          }
        }

        .hero-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          width: 100%;
        }

        .hero-name {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .hero-stats {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-xs);
        }

        .hero-power,
        .hero-redquench {
          display: inline-block;
        }

        .hero-power {
          color: var(--text-primary);
          font-weight: var(--font-weight-medium);
        }

        .hero-redquench {
          font-weight: var(--font-weight-bold);
          padding: 1px 6px;
          border-radius: var(--border-radius-full);

          &.redquench-high {
            color: var(--error-color);
            background: rgba(var(--error-color-rgb), 0.1);
          }

          &.redquench-medium {
            color: var(--warning-color);
            background: rgba(var(--warning-color-rgb), 0.1);
          }

          &.redquench-low {
            color: var(--success-color);
            background: rgba(var(--success-color-rgb), 0.1);
          }
        }
      }

      &.power {
        width: 100px;
        min-width: 100px;
        justify-content: center;
        font-weight: var(--font-weight-bold);
        color: var(--primary-color);
        font-size: var(--font-size-base);
        text-align: center;
      }

      &.level {
        width: 70px;
        min-width: 70px;
        justify-content: center;

        &::before {
          content: "Lv.";
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          margin-right: 2px;
        }

        span {
          display: inline-block;
          padding: 2px 8px;
          background: linear-gradient(
            135deg,
            var(--primary-color-light) 0%,
            var(--primary-color) 100%
          );
          color: white;
          border-radius: var(--border-radius-full);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
        }
      }

      &.server {
        width: 80px;
        min-width: 80px;
        justify-content: center;
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        text-align: center;
      }

      &.announcement {
        flex: 1;
        min-width: 150px;
        color: var(--text-secondary);
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
        font-size: var(--font-size-xs);
        line-height: 1.4;
        min-height: 24px;
        word-break: break-all;
      }
    }
  }
}

// 按钮样式调整
:deep(.n-button) {
  font-size: var(--font-size-sm);
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 输入框样式调整
:deep(.n-input-wrapper) {
  font-size: var(--font-size-sm);
}

// 响应式设计
@media (max-width: 1200px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);

    .stats-section {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .function-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);

    .function-right {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }
  }

  .alliance-tabs-section {
    overflow-x: auto;
    justify-content: flex-start;

    .alliance-tab {
      flex: 0 0 auto;
      white-space: nowrap;
    }
  }

  .table-container {
    font-size: var(--font-size-xs);

    .table-header {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .table-row {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .table-cell {
      padding: 0 var(--spacing-xs);
      font-size: var(--font-size-xs);

      &.rank {
        width: 50px;
        min-width: 50px;
      }

      &.alliance {
        width: 100px;
        min-width: 100px;
      }

      &.avatar {
        width: 50px;
        min-width: 50px;

        .member-avatar,
        .member-avatar-placeholder {
          width: 32px;
          height: 32px;
        }
      }

      &.name {
        width: 120px;
        min-width: 120px;
      }

      &.score,
      &.red-quench {
        width: 80px;
        min-width: 80px;
      }

      &.first-3 {
        width: 350px;
        min-width: 350px;

        .hero-card {
          min-width: 80px;

          .hero-avatar,
          .hero-avatar-placeholder {
            width: 40px;
            height: 40px;
          }

          .hero-name {
            font-size: var(--font-size-xs);
          }

          .hero-stats {
            font-size: var(--font-size-xs);
          }
        }
      }

      &.power {
        width: 100px;
        min-width: 100px;
      }

      &.level,
      &.server {
        width: 70px;
        min-width: 70px;
      }

      &.announcement {
        min-width: 150px;
      }
    }
  }
}

@media (max-width: 768px) {
  .club-warrank-container {
    padding: var(--spacing-xs);
  }

  .header-section {
    padding: var(--spacing-md);
  }

  .function-section {
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .alliance-tabs-section {
    padding: var(--spacing-xs) var(--spacing-xs);
  }

  :deep(.n-date-picker) {
    width: 180px !important;
  }
}
</style>
