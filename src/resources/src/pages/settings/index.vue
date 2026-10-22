<template>
  <Pagebar title="সেটিংস" />
  <Toast ref="toastRef" />

  <div class="settings-page w-100" style="min-width: 0; max-width: 100%; overflow-x: hidden;">
    <!-- ১. কোম্পানী/প্রতিষ্ঠানের তথ্য -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-building-fill me-2 fs-5"></i>কোম্পানী/প্রতিষ্ঠানের তথ্য
        </h6>

        <div>
          <button
            v-if="hasExistingProfile && !isEditingProfile"
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center"
            style="height: 34px;"
            @click="startEditProfile">
            <i class="bi bi-pencil-square me-1"></i>এডিট করুন
          </button>

          <div v-else class="d-flex align-items-center gap-2">
            <button
              v-if="hasExistingProfile"
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
              style="height: 34px;"
              @click="cancelEditProfile">
              <i class="bi bi-x-circle me-1"></i>বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center"
              style="height: 34px;"
              :disabled="savingProfile"
              @click="submitCompanyProfile">
              <span v-if="savingProfile" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-check-circle-fill me-1"></i>{{ hasExistingProfile ? 'আপডেট করুন' : 'সংরক্ষণ' }}
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-3 p-md-4">
        <!-- লোডিং স্পিনার -->
        <div v-if="loadingProfile" class="text-center py-4">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
          <span class="ms-2 text-muted small">প্রোফাইল তথ্য লোড হচ্ছে...</span>
        </div>

        <form v-else @submit.prevent="submitCompanyProfile">
          <div class="row g-3">
            <!-- কোম্পানীর নাম -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="companyName" class="d-flex align-items-center mb-1">
                <span>কোম্পানী / প্রতিষ্ঠানের নাম</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <input
                id="companyName"
                v-model="profileForm.companyName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': !!errors.companyName }"
                :disabled="!isEditingProfile"
                placeholder="যেমন: ভাই ভাই এন্টারপ্রাইজ / রানা ট্রেডার্স"
                required
                style="height: 38px;" />
              <div v-if="errors.companyName" class="invalid-feedback d-block small mt-1">
                {{ errors.companyName }}
              </div>
            </div>

            <!-- ব্যবসার ধরন -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="businessType" class="d-flex align-items-center mb-1">
                <span>ব্যবসার ধরন</span>
                <span class="text-danger ms-1">*</span>
              </label>
              <select
                id="businessType"
                v-model="profileForm.businessType"
                class="form-select"
                :disabled="!isEditingProfile"
                style="height: 38px;">
                <option value="একক মালিকানা">একক মালিকানা (Sole Proprietorship)</option>
                <option value="অংশীদারি">অংশীদারি (Partnership)</option>
                <option value="প্রাইভেট লিমিটেড">প্রাইভেট লিমিটেড (Private Limited)</option>
                <option value="পাবলিক লিমিটেড">পাবলিক লিমিটেড (Public Limited)</option>
                <option value="অন্যান্য">অন্যান্য (Other)</option>
              </select>
            </div>

            <!-- মোবাইল / ফোন -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="phone" class="d-flex align-items-center mb-1">
                <span>মোবাইল নম্বর</span>
              </label>
              <input
                id="phone"
                v-model="profileForm.phone"
                type="text"
                class="form-control"
                :disabled="!isEditingProfile"
                placeholder="যেমন: 017XXXXXXXX"
                style="height: 38px;" />
            </div>

            <!-- ইমেইল -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="email" class="d-flex align-items-center mb-1">
                <span>ইমেইল ঠিকানা</span>
              </label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="form-control"
                :disabled="!isEditingProfile"
                placeholder="info@company.com"
                style="height: 38px;" />
            </div>

            <!-- ট্রেড লাইসেন্স নং -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="tradeLicense" class="d-flex align-items-center mb-1">
                <span>ট্রেড লাইসেন্স নং (ঐচ্ছিক)</span>
              </label>
              <input
                id="tradeLicense"
                v-model="profileForm.tradeLicense"
                type="text"
                class="form-control"
                :disabled="!isEditingProfile"
                placeholder="TRAD/DSCC/XXXXXX"
                style="height: 38px;" />
            </div>

            <!-- টিআইএন / বিন নং -->
            <div class="col-12 col-md-6 col-xl-4">
              <label for="tinBin" class="d-flex align-items-center mb-1">
                <span>TIN / BIN নং (ঐচ্ছিক)</span>
              </label>
              <input
                id="tinBin"
                v-model="profileForm.tinBin"
                type="text"
                class="form-control"
                :disabled="!isEditingProfile"
                placeholder="১২ ডিজিট টিআইএন বা বিন"
                style="height: 38px;" />
            </div>

            <!-- ঠিকানা -->
            <div class="col-12">
              <label for="address" class="d-flex align-items-center mb-1">
                <span>ব্যবসা প্রতিষ্ঠানের পূর্ণ ঠিকানা</span>
              </label>
              <textarea
                id="address"
                v-model="profileForm.address"
                rows="2"
                class="form-control"
                :disabled="!isEditingProfile"
                placeholder="দোকান/অফিস নং, রাস্তা, বাজার বা থানা, জেলা..."></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- ২. শেয়ার হোল্ডার -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
            <i class="bi bi-people-fill me-2 fs-5"></i>শেয়ার হোল্ডার
          </h6>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap sh-header-actions">
          <!-- শেয়ার হিসাব ব্যাজ -->
          <span
            class="badge d-inline-flex align-items-center px-3 rounded-2 fw-semibold sh-badge"
            style="height: 34px; font-size: 0.875rem;"
            :class="totalSharePercent === 100 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'">
            মোট বণ্টন: {{ totalSharePercent }}%
          </span>
          <span
            class="badge bg-secondary-subtle text-secondary-emphasis border d-inline-flex align-items-center px-3 rounded-2 fw-semibold sh-badge"
            style="height: 34px; font-size: 0.875rem;">
            মোট সদস্য: {{ shareholdersList.length }} জন
          </span>
          <!-- নতুন শেয়ারহোল্ডার যোগ বাটন -->
          <button
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center sh-add-btn"
            style="height: 34px;"
            @click="openAddShareholderModal">
            <i class="bi bi-plus-circle me-1"></i>নতুন শেয়ারহোল্ডার যোগ
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- শেয়ারহোল্ডার লোডিং -->
        <div v-if="loadingShareholders" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted small mt-2">শেয়ারহোল্ডার তালিকা লোড হচ্ছে...</p>
        </div>

        <!-- কোনো শেয়ারহোল্ডার না থাকলে এম্পটি স্টেট -->
        <div v-else-if="shareholdersList.length === 0" class="text-center py-5 px-3">
          <div class="avatar-lg mx-auto mb-3 text-muted" style="font-size: 2.8rem;">
            <i class="bi bi-people"></i>
          </div>
          <h6 class="fw-bold text-body">কোনো শেয়ারহোল্ডার যোগ করা হয়নি</h6>
          <p class="text-muted small mb-3">
            পুঁজি বিনিয়োগ ট্র্যাকিংয়ের সুবিধার্থে আপনার প্রতিষ্ঠানের সকল অংশীদার বা শেয়ারহোল্ডারের নাম যোগ করুন।
          </p>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="openAddShareholderModal">
            <i class="bi bi-plus-lg me-1"></i>প্রথম শেয়ারহোল্ডার যোগ করুন
          </button>
        </div>

        <!-- শেয়ারহোল্ডার টেবিল -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="min-width: 680px;">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th style="width: 55px;" class="text-center">#</th>
                <th style="width: 25%;">শেয়ারহোল্ডারের নাম</th>
                <th style="width: 18%;">মোবাইল নম্বর</th>
                <th style="width: 17%;">পদবি / ভূমিকা</th>
                <th style="width: 16%;">শেয়ারের হার (%)</th>
                <th style="width: 14%;">এনআইডি নং</th>
                <th style="width: 90px;" class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(shareholder, index) in shareholdersList" :key="shareholder.id">
                <td class="text-center text-body fw-semibold small">
                  {{ index + 1 }}
                </td>

                <!-- নাম ও লোগো ব্যাজ -->
                <td>
                  <div class="d-flex align-items-center">
                    <div
                      class="avatar-xs rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold small bg-primary"
                      style="width: 34px; height: 34px; font-size: 0.85rem; flex-shrink: 0;">
                      {{ shareholder.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-body text-truncate" style="max-width: 200px;">
                        {{ shareholder.name }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- মোবাইল -->
                <td>
                  <span v-if="shareholder.mobile" class="fw-medium text-body">
                    <i class="bi bi-telephone opacity-75 me-1 small"></i>{{ shareholder.mobile }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>

                <!-- পদবি -->
                <td>
                  <span class="badge bg-secondary-subtle text-secondary-emphasis border px-2 py-1">
                    {{ shareholder.role }}
                  </span>
                </td>

                <!-- শেয়ার হার % -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold text-primary font-monospace">
                      {{ Number(shareholder.sharePercentage).toFixed(2) }}%
                    </span>
                    <div class="progress flex-grow-1" style="height: 6px; max-width: 60px;">
                      <div
                        class="progress-bar bg-primary"
                        role="progressbar"
                        :style="{ width: Math.min(Number(shareholder.sharePercentage), 100) + '%' }"></div>
                    </div>
                  </div>
                </td>

                <!-- এনআইডি -->
                <td>
                  <span v-if="shareholder.nid" class="font-monospace small text-body">
                    {{ shareholder.nid }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>

                <!-- অ্যাকশন বাটন -->
                <td class="text-end pe-3">
                  <div class="d-inline-flex align-items-center gap-1 justify-content-end">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary btn-action"
                      title="তথ্য এডিট করুন"
                      @click="openEditShareholderModal(shareholder)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger btn-action"
                      title="মুছে ফেলুন"
                      @click="confirmDeleteShareholder(shareholder)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ৩. প্রিন্ট সেটিংস -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-printer-fill me-2 fs-5"></i>প্রিন্ট সেটিংস
        </h6>

        <div>
          <button
            v-if="!isEditingPrint"
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center"
            style="height: 34px;"
            @click="startEditPrint">
            <i class="bi bi-pencil-square me-1"></i>এডিট করুন
          </button>

          <div v-else class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
              style="height: 34px;"
              @click="cancelEditPrint">
              <i class="bi bi-x-circle me-1"></i>বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center"
              style="height: 34px;"
              :disabled="savingPrint"
              @click="submitPrintSettings">
              <span v-if="savingPrint" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-check-circle-fill me-1"></i>আপডেট করুন
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold mb-1">ডিফল্ট প্রিন্টার লেআউট</label>
            <select v-model="printForm.printerLayout" class="form-select" :disabled="!isEditingPrint" style="height: 38px;">
              <option value="pos">থার্মাল পিওএস রিসিট (80mm POS Slip)</option>
              <option value="a4">সাধারণ এ-ফোর পেপার (A4 Full Page)</option>
              <option value="a5">হাফ পেপার (A5 Landscape)</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold mb-1">প্রিন্ট হেডারে কোম্পানির নাম ও লোগো প্রদর্শন</label>
            <select v-model="printForm.printHeaderShow" class="form-select" :disabled="!isEditingPrint" style="height: 38px;">
              <option value="yes">হ্যাঁ, প্রদর্শন করা হবে</option>
              <option value="no">না, কেবল সাধারণ টেক্সট থাকবে</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- ৪. মানি রিসিট সেটিংস -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
          <i class="bi bi-receipt-cutoff me-2 fs-5"></i>মানি রিসিট সেটিংস
        </h6>

        <div>
          <button
            v-if="!isEditingReceipt"
            type="button"
            class="btn btn-sm btn-primary d-inline-flex align-items-center"
            style="height: 34px;"
            @click="startEditReceipt">
            <i class="bi bi-pencil-square me-1"></i>এডিট করুন
          </button>

          <div v-else class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
              style="height: 34px;"
              @click="cancelEditReceipt">
              <i class="bi bi-x-circle me-1"></i>বাতিল
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary d-inline-flex align-items-center"
              style="height: 34px;"
              :disabled="savingReceipt"
              @click="submitReceiptSettings">
              <span v-if="savingReceipt" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-check-circle-fill me-1"></i>আপডেট করুন
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold mb-1">রিসিট নম্বর প্রিফিক্স</label>
            <input
              v-model="receiptForm.receiptPrefix"
              type="text"
              class="form-control"
              :disabled="!isEditingReceipt"
              placeholder="যেমন: MR- বা REC-"
              style="height: 38px;" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold mb-1">রিসিট ফুটার নোট / শুভেচ্ছা বার্তা</label>
            <input
              v-model="receiptForm.receiptFooterNote"
              type="text"
              class="form-control"
              :disabled="!isEditingReceipt"
              placeholder="ধন্যবাদ বা নিয়মাবলি..."
              style="height: 38px;" />
          </div>
        </div>
      </div>
    </div>

    <!-- ৫. কোম্পানি অফার ও ডিসবার্সমেন্ট পলিসি -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
            <i class="bi bi-gift-fill me-2 fs-5"></i>কোম্পানি অফার ও ডিসবার্সমেন্ট পলিসি
          </h6>
          <small class="text-muted">বিকাশ, নগদ বা রকেট কোম্পানির টার্গেট বোনাস ও ইনসেন্টিভ অফার সেট করুন</small>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-primary d-inline-flex align-items-center"
          style="height: 34px;"
          @click="openOfferModal()">
          <i class="bi bi-plus-lg me-1"></i>নতুন অফার যোগ করুন
        </button>
      </div>

      <div class="card-body p-0">
        <div v-if="loadingOffers" class="text-center py-4">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
          <span class="ms-2 text-muted small">অফার তালিকা লোড হচ্ছে...</span>
        </div>

        <div v-else-if="offersList.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50"></i>
          <p class="mb-0">কোনো অফার রুল সেট করা নেই। নতুন অফার যোগ করুন।</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">অফারের নাম</th>
                <th>কোম্পানি</th>
                <th>লেনদেনের ধরন</th>
                <th>টার্গেট</th>
                <th>বোনাস / পুরস্কার</th>
                <th>সেটেলমেন্ট</th>
                <th>মেয়াদ</th>
                <th class="text-center">স্ট্যাটাস</th>
                <th class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in offersList" :key="offer.id">
                <td class="ps-3 fw-semibold text-dark">{{ offer.title }}</td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border">
                    {{ offer.provider?.providerName || 'সকল কোম্পানি' }}
                  </span>
                </td>
                <td>{{ offer.transactionType }}</td>
                <td class="fw-medium">৳{{ Number(offer.targetThreshold).toLocaleString('en-IN') }}</td>
                <td>
                  <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold">
                    {{ offer.rewardType === 'percentage' ? `${offer.rewardValue}%` : `৳${offer.rewardValue}` }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-info-subtle text-info border">
                    {{ offer.settlementType === 'instant' ? 'তাৎক্ষণিক' : offer.settlementType === 'daily' ? 'দৈনিক' : 'মাসিক' }}
                  </span>
                </td>
                <td class="small text-muted">
                  {{ offer.startDate || '—' }} হতে {{ offer.endDate || 'চলমান' }}
                </td>
                <td class="text-center">
                  <div class="form-check form-switch d-inline-block">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="offer.isActive"
                      @change="toggleOffer(offer)">
                  </div>
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-action" title="এডিট" @click="openOfferModal(offer)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-action ms-1" title="ডিলিট" @click="deleteOffer(offer.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ৬. গ্রাহক সার্ভিস চার্জ পলিসি (ফি রুলস) -->
    <div class="card border shadow-sm mb-4 w-100">
      <div class="card-header bg-transparent py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h6 class="mb-0 fw-bold text-primary d-flex align-items-center">
            <i class="bi bi-calculator-fill me-2 fs-5"></i>গ্রাহক সার্ভিস চার্জ পলিসি (ফি রুলস)
          </h6>
          <small class="text-muted">পে-বিল বা লেনদেনে গ্রাহকের থেকে নেওয়া সার্ভিস ফি (যেমন ফিক্সড ১০ টাকা বা স্ল্যাব চার্জ) স্বয়ংক্রিয় করতে সেট করুন</small>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-primary d-inline-flex align-items-center"
          style="height: 34px;"
          @click="openFeeModal()">
          <i class="bi bi-plus-lg me-1"></i>নতুন ফি রুল যোগ করুন
        </button>
      </div>

      <div class="card-body p-0">
        <div v-if="loadingFees" class="text-center py-4">
          <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
          <span class="ms-2 text-muted small">ফি রুলস লোড হচ্ছে...</span>
        </div>

        <div v-else-if="feesList.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-receipt fs-1 d-block mb-2 text-secondary opacity-50"></i>
          <p class="mb-0">কোনো সার্ভিস ফি রুল নেই। নতুন ফি রুল যোগ করুন।</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-3">লেনদেনের ধরন</th>
                <th>বিলার / সার্ভিস</th>
                <th>চার্জের ধরন</th>
                <th>ফি / চার্জ রেট</th>
                <th class="text-center">স্ট্যাটাস</th>
                <th class="text-end pe-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fee in feesList" :key="fee.id">
                <td class="ps-3 fw-semibold text-dark">{{ fee.transactionType }}</td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary border">
                    {{ fee.billerName || 'সকল বিলার' }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-primary-subtle text-primary border">
                    {{ fee.feeType === 'flat' ? 'ফিক্সড চার্জ' : fee.feeType === 'percentage' ? 'শতকরা (%)' : 'স্ল্যাবভিত্তিক' }}
                  </span>
                </td>
                <td>
                  <span v-if="fee.feeType === 'flat'" class="fw-bold text-success">৳{{ Number(fee.flatFee).toFixed(2) }}</span>
                  <span v-else-if="fee.feeType === 'percentage'" class="fw-bold text-info">{{ fee.percentageFee }}%</span>
                  <div v-else class="small text-muted">
                    <span v-for="(slab, i) in (fee.slabsJson || [])" :key="i" class="badge bg-light text-dark border me-1 mb-1">
                      ৳{{ slab.min }}-{{ slab.max }}: ৳{{ slab.fee }}
                    </span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="form-check form-switch d-inline-block">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="fee.isActive"
                      @change="toggleFee(fee)">
                  </div>
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-action" title="এডিট" @click="openFeeModal(fee)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-action ms-1" title="ডিলিট" @click="deleteFee(fee.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- শেয়ারহোল্ডার যোগ / এডিট মডাল -->
    <div
      v-if="showShareholderModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 680px;">
        <div class="modal-content shadow">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-person-plus-fill text-primary me-2"></i>{{ isEditingShareholder ? 'শেয়ারহোল্ডার তথ্য আপডেট করুন' : 'নতুন শেয়ারহোল্ডার যোগ করুন' }}
            </h6>
            <button type="button" class="btn-close" @click="closeShareholderModal"></button>
          </div>
          <form @submit.prevent="submitShareholder">
            <div class="modal-body p-3 p-md-4">
              <div class="row g-3">
                <!-- নাম -->
                <div class="col-12 col-sm-6">
                  <label for="shName" class="form-label fw-semibold mb-1">
                    শেয়ারহোল্ডারের নাম <span class="text-danger">*</span>
                  </label>
                  <input
                    id="shName"
                    v-model="shareholderForm.name"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    required
                    style="height: 38px;" />
                </div>

                <!-- মোবাইল -->
                <div class="col-12 col-sm-6">
                  <label for="shMobile" class="form-label fw-semibold mb-1">মোবাইল নম্বর</label>
                  <input
                    id="shMobile"
                    v-model="shareholderForm.mobile"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: 017XXXXXXXX"
                    style="height: 38px;" />
                </div>

                <!-- পদবি / ভূমিকা -->
                <div class="col-12 col-sm-6">
                  <label for="shRole" class="form-label fw-semibold mb-1">পদবি / ভূমিকা</label>
                  <select id="shRole" v-model="shareholderForm.role" class="form-select" style="height: 38px;">
                    <option value="মালিক">মালিক (Owner)</option>
                    <option value="ব্যবস্থাপনা পরিচালক">ব্যবস্থাপনা পরিচালক (Managing Director)</option>
                    <option value="পরিচালক">পরিচালক (Director)</option>
                    <option value="অংশীদার">অংশীদার (Partner)</option>
                    <option value="শেয়ারহোল্ডার">শেয়ারহোল্ডার (Shareholder)</option>
                  </select>
                </div>

                <!-- শেয়ারের শতকরা হার (%) -->
                <div class="col-12 col-sm-6">
                  <label for="shPercentage" class="form-label fw-semibold mb-1">
                    শেয়ারের হার (%) <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input
                      id="shPercentage"
                      v-model.number="shareholderForm.sharePercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      class="form-control"
                      placeholder="যেমন: 50.00"
                      required
                      style="height: 38px;" />
                    <span class="input-group-text">%</span>
                  </div>
                </div>

                <!-- এনআইডি -->
                <div class="col-12">
                  <label for="shNid" class="form-label fw-semibold mb-1">জাতীয় পরিচয়পত্র নং (NID - ঐচ্ছিক)</label>
                  <input
                    id="shNid"
                    v-model="shareholderForm.nid"
                    type="text"
                    class="form-control"
                    placeholder="১০/১৩/১৭ ডিজিট এনআইডি"
                    style="height: 38px;" />
                </div>
              </div>
            </div>

            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary" @click="closeShareholderModal">
                বাতিল
              </button>
              <button type="submit" class="btn btn-primary" :disabled="savingShareholder">
                <span v-if="savingShareholder" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditingShareholder ? 'আপডেট করুন' : 'যোগ করুন' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- শেয়ারহোল্ডার মুছে ফেলার কনফার্মেশন মডাল -->
    <div
      v-if="deletingShareholderItem"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-danger">
          <div class="modal-header py-3 bg-danger-subtle text-danger">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>শেয়ারহোল্ডার ডিলিট নিশ্চিতকরণ
            </h6>
            <button type="button" class="btn-close" @click="deletingShareholderItem = null"></button>
          </div>
          <div class="modal-body p-4 text-center">
            <div class="avatar-lg mx-auto mb-3 text-danger" style="font-size: 2.5rem;">
              <i class="bi bi-trash"></i>
            </div>
            <h6 class="fw-bold mb-2">আপনি কি নিশ্চিত এই শেয়ারহোল্ডার মুছে ফেলতে চান?</h6>
            <p class="text-muted small mb-0">
              নাম: <strong>{{ deletingShareholderItem.name }}</strong> ({{ deletingShareholderItem.role }})<br>
              শেয়ারের অনুপাত: <strong>{{ deletingShareholderItem.sharePercentage }}%</strong>
            </p>
          </div>
          <div class="modal-footer py-2">
            <button type="button" class="btn btn-secondary" @click="deletingShareholderItem = null">
              বাতিল
            </button>
            <button
              type="button"
              class="btn btn-danger"
              :disabled="deletingSubmitting"
              @click="deleteShareholderItem">
              <span v-if="deletingSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              হ্যাঁ, মুছে ফেলুন
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- অফার যোগ / এডিট মডাল -->
    <div
      v-if="showOfferModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 680px;">
        <div class="modal-content shadow">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-gift-fill text-primary me-2"></i>{{ editingOfferId ? 'অফার আপডেট করুন' : 'নতুন কোম্পানি অফার যোগ করুন' }}
            </h6>
            <button type="button" class="btn-close" @click="closeOfferModal"></button>
          </div>
          <form @submit.prevent="submitOffer">
            <div class="modal-body p-3 p-md-4">
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">অফারের শিরোনাম <span class="text-danger">*</span></label>
                  <input
                    v-model="offerForm.title"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: মাসিক ভলিউম বোনাস"
                    required
                    style="height: 38px;" />
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">কোম্পানি / ওয়ালেট</label>
                  <select v-model="offerForm.providerId" class="form-select" style="height: 38px;">
                    <option :value="null">সকল কোম্পানি (General)</option>
                    <option v-for="prov in merchantProvidersList" :key="prov.id" :value="prov.id">
                      {{ prov.providerName }} ({{ prov.accountType }})
                    </option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">লেনদেনের ধরন</label>
                  <select v-model="offerForm.transactionType" class="form-select" style="height: 38px;">
                    <option value="সকল">সকল লেনদেন</option>
                    <option value="ক্যাশ ইন">ক্যাশ ইন</option>
                    <option value="ক্যাশ আউট">ক্যাশ আউট</option>
                    <option value="পে-বিল">পে-বিল</option>
                    <option value="ট্রান্সফার">ট্রান্সফার</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">শর্তের ধরন</label>
                  <select v-model="offerForm.triggerType" class="form-select" style="height: 38px;">
                    <option value="target_amount">টার্গেট ভলিউম (মোট টাকা)</option>
                    <option value="per_transaction">প্রতিটি লেনদেনে</option>
                    <option value="transaction_count">লেনদেনের সংখ্যা (কাউন্ট)</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">টার্গেট সীমা (টাকা / সংখ্যা)</label>
                  <input
                    v-model.number="offerForm.targetThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    placeholder="যেমন: 500000"
                    style="height: 38px;" />
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">পুরস্কার / বোনাসের ধরন</label>
                  <select v-model="offerForm.rewardType" class="form-select" style="height: 38px;">
                    <option value="percentage">শতকরা হার (%)</option>
                    <option value="flat">ফিক্সড টাকা (৳)</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">
                    বোনাসের পরিমাণ {{ offerForm.rewardType === 'percentage' ? '(%)' : '(৳)' }} <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model.number="offerForm.rewardValue"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    placeholder="যেমন: 0.20 বা 500"
                    required
                    style="height: 38px;" />
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">জমা হওয়ার ধরন (Settlement)</label>
                  <select v-model="offerForm.settlementType" class="form-select" style="height: 38px;">
                    <option value="monthly">মাসিক শেষে (Monthly)</option>
                    <option value="daily">দৈনিক শেষে (Daily)</option>
                    <option value="instant">তাৎক্ষণিক (Instant)</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">অফার শুরু</label>
                  <input v-model="offerForm.startDate" type="date" class="form-control" style="height: 38px;" />
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">অফার শেষ</label>
                  <input v-model="offerForm.endDate" type="date" class="form-control" style="height: 38px;" />
                </div>
              </div>
            </div>
            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary" @click="closeOfferModal">বাতিল</button>
              <button type="submit" class="btn btn-primary" :disabled="savingOffer">
                <span v-if="savingOffer" class="spinner-border spinner-border-sm me-1"></span>
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- সার্ভিস ফি পলিসি যোগ / এডিট মডাল -->
    <div
      v-if="showFeeModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 680px;">
        <div class="modal-content shadow">
          <div class="modal-header py-3">
            <h6 class="modal-title fw-bold">
              <i class="bi bi-calculator-fill text-primary me-2"></i>{{ editingFeeId ? 'ফি পলিসি আপডেট' : 'নতুন গ্রাহক সার্ভিস ফি রুল' }}
            </h6>
            <button type="button" class="btn-close" @click="closeFeeModal"></button>
          </div>
          <form @submit.prevent="submitFee">
            <div class="modal-body p-3 p-md-4">
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">লেনদেনের ধরন <span class="text-danger">*</span></label>
                  <select v-model="feeForm.transactionType" class="form-select" style="height: 38px;">
                    <option value="পে-বিল">পে-বিল</option>
                    <option value="ক্যাশ ইন">ক্যাশ ইন</option>
                    <option value="ক্যাশ আউট">ক্যাশ আউট</option>
                    <option value="ট্রান্সফার">ট্রান্সফার</option>
                  </select>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">নির্দিষ্ট বিলার (ঐচ্ছিক)</label>
                  <input
                    v-model="feeForm.billerName"
                    type="text"
                    class="form-control"
                    placeholder="যেমন: পল্লী বিদ্যুৎ বা খালি রাখুন (সকল)"
                    style="height: 38px;" />
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">চার্জের ধরন <span class="text-danger">*</span></label>
                  <select v-model="feeForm.feeType" class="form-select" style="height: 38px;">
                    <option value="flat">ফিক্সড টাকা (যেমন ১০ টাকা)</option>
                    <option value="percentage">শতকরা (%)</option>
                    <option value="slab">স্ল্যাবভিত্তিক রেঞ্জ</option>
                  </select>
                </div>

                <div v-if="feeForm.feeType === 'flat'" class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">ফিক্সড চার্জের পরিমাণ (৳) <span class="text-danger">*</span></label>
                  <input
                    v-model.number="feeForm.flatFee"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    placeholder="যেমন: 10.00"
                    required
                    style="height: 38px;" />
                </div>

                <div v-if="feeForm.feeType === 'percentage'" class="col-12 col-sm-6">
                  <label class="form-label fw-semibold mb-1">শতকরা চার্জের হার (%) <span class="text-danger">*</span></label>
                  <input
                    v-model.number="feeForm.percentageFee"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    placeholder="যেমন: 0.50"
                    required
                    style="height: 38px;" />
                </div>

                <!-- স্ল্যাব রেঞ্জ বিল্ডার -->
                <div v-if="feeForm.feeType === 'slab'" class="col-12">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label fw-semibold mb-0">স্ল্যাব রেঞ্জসমূহ</label>
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="addSlabRow">
                      <i class="bi bi-plus me-1"></i>স্ল্যাব যোগ করুন
                    </button>
                  </div>

                  <div v-for="(slab, index) in feeForm.slabs" :key="index" class="d-flex gap-2 align-items-center mb-2">
                    <input
                      v-model.number="slab.min"
                      type="number"
                      class="form-control form-control-sm"
                      placeholder="শুরু (টাকা)"
                      style="height: 34px;" />
                    <span>হতে</span>
                    <input
                      v-model.number="slab.max"
                      type="number"
                      class="form-control form-control-sm"
                      placeholder="শেষ (টাকা)"
                      style="height: 34px;" />
                    <span>ফি:</span>
                    <input
                      v-model.number="slab.fee"
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm"
                      placeholder="ফি (৳)"
                      style="height: 34px; max-width: 100px;" />
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeSlabRow(index)">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer py-2">
              <button type="button" class="btn btn-secondary" @click="closeFeeModal">বাতিল</button>
              <button type="submit" class="btn btn-primary" :disabled="savingFee">
                <span v-if="savingFee" class="spinner-border spinner-border-sm me-1"></span>
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import Pagebar from "@/components/Pagebar.vue";
import Toast from "@/components/Toast.vue";

useHead({ title: "সেটিংস - MFS Ledger" });

const toastRef = ref<any>(null);

// স্টেট
const loadingProfile = ref(false);
const savingProfile = ref(false);
const loadingShareholders = ref(false);
const savingShareholder = ref(false);
const deletingSubmitting = ref(false);

const isEditingProfile = ref(true);
const hasExistingProfile = ref(false);

const profileForm = reactive({
  companyName: "",
  businessType: "একক মালিকানা",
  phone: "",
  email: "",
  address: "",
  tradeLicense: "",
  tinBin: ""
});

const originalProfile = ref({ ...profileForm });

const errors = reactive({
  companyName: ""
});

function startEditProfile() {
  isEditingProfile.value = true;
}

function cancelEditProfile() {
  Object.assign(profileForm, originalProfile.value);
  errors.companyName = "";
  isEditingProfile.value = false;
}

// প্রিন্ট সেটিংস স্টেট
const isEditingPrint = ref(false);
const savingPrint = ref(false);
const printForm = reactive({
  printerLayout: "pos",
  printHeaderShow: "yes"
});
const originalPrint = ref({ ...printForm });

function startEditPrint() {
  isEditingPrint.value = true;
}

function cancelEditPrint() {
  Object.assign(printForm, originalPrint.value);
  isEditingPrint.value = false;
}

async function submitPrintSettings() {
  savingPrint.value = true;
  try {
    const res: any = await axios.post("/api/company/print-settings", {
      printerLayout: printForm.printerLayout,
      printHeaderShow: printForm.printHeaderShow
    });
    originalPrint.value = { ...printForm };
    isEditingPrint.value = false;
    toastRef.value?.success(res?.data?.message || "প্রিন্ট সেটিংস সফলভাবে আপডেট করা হয়েছে");
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "প্রিন্ট সেটিংস আপডেট করতে সমস্যা হয়েছে");
  } finally {
    savingPrint.value = false;
  }
}

// মানি রিসিট সেটিংস স্টেট
const isEditingReceipt = ref(false);
const savingReceipt = ref(false);
const receiptForm = reactive({
  receiptPrefix: "MR-",
  receiptFooterNote: "আমাদের সাথে লেনদেন করার জন্য ধন্যবাদ!"
});
const originalReceipt = ref({ ...receiptForm });

function startEditReceipt() {
  isEditingReceipt.value = true;
}

function cancelEditReceipt() {
  Object.assign(receiptForm, originalReceipt.value);
  isEditingReceipt.value = false;
}

async function submitReceiptSettings() {
  savingReceipt.value = true;
  try {
    const res: any = await axios.post("/api/company/receipt-settings", {
      receiptPrefix: receiptForm.receiptPrefix.trim() || "MR-",
      receiptFooterNote: receiptForm.receiptFooterNote.trim()
    });
    originalReceipt.value = { ...receiptForm };
    isEditingReceipt.value = false;
    toastRef.value?.success(res?.data?.message || "মানি রিসিট সেটিংস সফলভাবে আপডেট করা হয়েছে");
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "মানি রিসিট সেটিংস আপডেট করতে সমস্যা হয়েছে");
  } finally {
    savingReceipt.value = false;
  }
}

// শেয়ারহোল্ডার স্টেট
interface Shareholder {
  id: number;
  name: string;
  mobile?: string | null;
  role: string;
  sharePercentage: string | number;
  nid?: string | null;
  isActive: boolean;
}

const shareholdersList = ref<Shareholder[]>([]);
const showShareholderModal = ref(false);
const isEditingShareholder = ref(false);
const currentEditingId = ref<number | null>(null);

const shareholderForm = reactive({
  name: "",
  mobile: "",
  role: "অংশীদার",
  sharePercentage: 50,
  nid: "",
  isActive: true
});

const deletingShareholderItem = ref<Shareholder | null>(null);

// মোট শেয়ার শতকরা হার
const totalSharePercent = computed(() => {
  const sum = shareholdersList.value.reduce((acc, s) => acc + (Number(s.sharePercentage) || 0), 0);
  return Number(sum.toFixed(2));
});

// কোম্পানি ও শেয়ারহোল্ডার ডেটা লোড
async function loadCompanySettings() {
  loadingProfile.value = true;
  loadingShareholders.value = true;
  try {
    const res: any = await axios.get("/api/company");
    if (res?.data?.data) {
      const { profile, shareholders } = res.data.data;
      if (profile && profile.companyName) {
        profileForm.companyName = profile.companyName || "";
        profileForm.businessType = profile.businessType || "একক মালিকানা";
        profileForm.phone = profile.phone || "";
        profileForm.email = profile.email || "";
        profileForm.address = profile.address || "";
        profileForm.tradeLicense = profile.tradeLicense || "";
        profileForm.tinBin = profile.tinBin || "";

        originalProfile.value = { ...profileForm };
        hasExistingProfile.value = true;
        isEditingProfile.value = false;
      } else {
        hasExistingProfile.value = false;
        isEditingProfile.value = true;
      }

      if (profile) {
        if (profile.printerLayout) printForm.printerLayout = profile.printerLayout;
        if (profile.printHeaderShow) printForm.printHeaderShow = profile.printHeaderShow;
        originalPrint.value = { ...printForm };

        if (profile.receiptPrefix) receiptForm.receiptPrefix = profile.receiptPrefix;
        if (profile.receiptFooterNote !== undefined && profile.receiptFooterNote !== null) {
          receiptForm.receiptFooterNote = profile.receiptFooterNote;
        }
        originalReceipt.value = { ...receiptForm };
      }

      if (Array.isArray(shareholders)) {
        shareholdersList.value = shareholders;
      }
    }
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "কোম্পানির তথ্য লোড করতে সমস্যা হয়েছে");
  } finally {
    loadingProfile.value = false;
    loadingShareholders.value = false;
  }
}

// কোম্পানি প্রোফাইল সাবমিট
async function submitCompanyProfile() {
  errors.companyName = "";
  if (!profileForm.companyName.trim()) {
    errors.companyName = "কোম্পানী বা প্রতিষ্ঠানের নাম আবশ্যক";
    return;
  }

  savingProfile.value = true;
  try {
    const payload = {
      companyName: profileForm.companyName.trim(),
      businessType: profileForm.businessType,
      phone: profileForm.phone.trim() || null,
      email: profileForm.email.trim() || null,
      address: profileForm.address.trim() || null,
      tradeLicense: profileForm.tradeLicense.trim() || null,
      tinBin: profileForm.tinBin.trim() || null
    };

    const res: any = await axios.post("/api/company/profile", payload);
    originalProfile.value = { ...profileForm };
    hasExistingProfile.value = true;
    isEditingProfile.value = false;
    toastRef.value?.success(res?.data?.message || "কোম্পানীর তথ্য সফলভাবে সংরক্ষণ করা হয়েছে");
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "কোম্পানীর তথ্য সংরক্ষণ করতে সমস্যা হয়েছে");
  } finally {
    savingProfile.value = false;
  }
}

// শেয়ারহোল্ডার মডাল ওপেন
function openAddShareholderModal() {
  isEditingShareholder.value = false;
  currentEditingId.value = null;

  // অবশিষ্ট শেয়ারের পরিমাণ নির্ধারণ (ডিফল্ট হিসেবে সাজেস্ট করার জন্য)
  const remaining = Math.max(0, 100 - totalSharePercent.value);
  shareholderForm.name = "";
  shareholderForm.mobile = "";
  shareholderForm.role = profileForm.businessType === "একক মালিকানা" ? "মালিক" : "অংশীদার";
  shareholderForm.sharePercentage = remaining > 0 ? remaining : 0;
  shareholderForm.nid = "";
  shareholderForm.isActive = true;

  showShareholderModal.value = true;
}

function openEditShareholderModal(item: Shareholder) {
  isEditingShareholder.value = true;
  currentEditingId.value = item.id;
  shareholderForm.name = item.name;
  shareholderForm.mobile = item.mobile || "";
  shareholderForm.role = item.role || "অংশীদার";
  shareholderForm.sharePercentage = Number(item.sharePercentage) || 0;
  shareholderForm.nid = item.nid || "";
  shareholderForm.isActive = item.isActive !== false;

  showShareholderModal.value = true;
}

function closeShareholderModal() {
  showShareholderModal.value = false;
  currentEditingId.value = null;
}

// শেয়ারহোল্ডার সাবমিট
async function submitShareholder() {
  if (!shareholderForm.name.trim()) return;

  savingShareholder.value = true;
  try {
    const payload = {
      name: shareholderForm.name.trim(),
      mobile: shareholderForm.mobile.trim() || null,
      role: shareholderForm.role,
      sharePercentage: shareholderForm.sharePercentage,
      nid: shareholderForm.nid.trim() || null,
      isActive: shareholderForm.isActive
    };

    if (isEditingShareholder.value && currentEditingId.value) {
      const res: any = await axios.put(`/api/company/shareholders/${currentEditingId.value}`, payload);
      toastRef.value?.success("শেয়ারহোল্ডার তথ্য সফলভাবে আপডেট হয়েছে");
      if (res?.data?.data) {
        const idx = shareholdersList.value.findIndex(s => s.id === currentEditingId.value);
        if (idx !== -1) {
          shareholdersList.value[idx] = res.data.data;
        }
      }
    } else {
      const res: any = await axios.post("/api/company/shareholders", payload);
      toastRef.value?.success("শেয়ারহোল্ডার সফলভাবে যোগ করা হয়েছে");
      if (res?.data?.data) {
        shareholdersList.value.push(res.data.data);
      }
    }

    closeShareholderModal();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "শেয়ারহোল্ডার সংরক্ষণ করতে ব্যর্থ হয়েছে");
  } finally {
    savingShareholder.value = false;
  }
}

// শেয়ারহোল্ডার ডিলিট
function confirmDeleteShareholder(item: Shareholder) {
  deletingShareholderItem.value = item;
}

async function deleteShareholderItem() {
  if (!deletingShareholderItem.value) return;

  deletingSubmitting.value = true;
  try {
    await axios.delete(`/api/company/shareholders/${deletingShareholderItem.value.id}`);
    toastRef.value?.success("শেয়ারহোল্ডার সফলভাবে মুছে ফেলা হয়েছে");
    shareholdersList.value = shareholdersList.value.filter(s => s.id !== deletingShareholderItem.value?.id);
    deletingShareholderItem.value = null;
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে");
  } finally {
    deletingSubmitting.value = false;
  }
}

// ==========================================
// কোম্পানি অফার ও গ্রাহক ফি স্টেট ও মেথড
// ==========================================

const merchantProvidersList = ref<any[]>([]);
const offersList = ref<any[]>([]);
const feesList = ref<any[]>([]);
const loadingOffers = ref(false);
const savingOffer = ref(false);
const showOfferModal = ref(false);
const editingOfferId = ref<number | null>(null);

const offerForm = reactive({
  providerId: null as number | null,
  title: "",
  transactionType: "সকল",
  triggerType: "target_amount",
  targetThreshold: 0,
  rewardType: "percentage",
  rewardValue: 0,
  settlementType: "monthly",
  startDate: "",
  endDate: ""
});

const loadingFees = ref(false);
const savingFee = ref(false);
const showFeeModal = ref(false);
const editingFeeId = ref<number | null>(null);

const feeForm = reactive({
  transactionType: "পে-বিল",
  billerName: "",
  feeType: "flat",
  flatFee: 0,
  percentageFee: 0,
  slabs: [{ min: 1, max: 1000, fee: 5 }]
});

async function loadProviders() {
  try {
    const res = await axios.get("/api/providers");
    merchantProvidersList.value = res.data.data || [];
  } catch (e) {
    console.error("Failed to load providers", e);
  }
}

async function loadCompanyOffers() {
  loadingOffers.value = true;
  try {
    const res = await axios.get("/api/settings/company-offers");
    offersList.value = res.data.data || [];
  } catch (e) {
    console.error("Failed to load company offers", e);
  } finally {
    loadingOffers.value = false;
  }
}

function openOfferModal(item?: any) {
  if (item) {
    editingOfferId.value = item.id;
    offerForm.providerId = item.providerId;
    offerForm.title = item.title;
    offerForm.transactionType = item.transactionType;
    offerForm.triggerType = item.triggerType;
    offerForm.targetThreshold = Number(item.targetThreshold);
    offerForm.rewardType = item.rewardType;
    offerForm.rewardValue = Number(item.rewardValue);
    offerForm.settlementType = item.settlementType;
    offerForm.startDate = item.startDate || "";
    offerForm.endDate = item.endDate || "";
  } else {
    editingOfferId.value = null;
    offerForm.providerId = null;
    offerForm.title = "";
    offerForm.transactionType = "সকল";
    offerForm.triggerType = "target_amount";
    offerForm.targetThreshold = 0;
    offerForm.rewardType = "percentage";
    offerForm.rewardValue = 0;
    offerForm.settlementType = "monthly";
    offerForm.startDate = "";
    offerForm.endDate = "";
  }
  showOfferModal.value = true;
}

function closeOfferModal() {
  showOfferModal.value = false;
  editingOfferId.value = null;
}

async function submitOffer() {
  savingOffer.value = true;
  try {
    const payload = {
      providerId: offerForm.providerId,
      title: offerForm.title,
      transactionType: offerForm.transactionType,
      triggerType: offerForm.triggerType,
      targetThreshold: offerForm.targetThreshold,
      rewardType: offerForm.rewardType,
      rewardValue: offerForm.rewardValue,
      settlementType: offerForm.settlementType,
      startDate: offerForm.startDate || null,
      endDate: offerForm.endDate || null
    };

    if (editingOfferId.value) {
      await axios.put(`/api/settings/company-offers/${editingOfferId.value}`, payload);
      toastRef.value?.success("অফার সফলভাবে আপডেট হয়েছে");
    } else {
      await axios.post("/api/settings/company-offers", payload);
      toastRef.value?.success("নতুন অফার সফলভাবে তৈরি হয়েছে");
    }
    closeOfferModal();
    loadCompanyOffers();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "অফার সংরক্ষণে ব্যর্থ হয়েছে");
  } finally {
    savingOffer.value = false;
  }
}

async function toggleOffer(offer: any) {
  try {
    await axios.patch(`/api/settings/company-offers/${offer.id}/toggle`);
    offer.isActive = !offer.isActive;
    toastRef.value?.success("স্ট্যাটাস পরিবর্তন হয়েছে");
  } catch (e: any) {
    toastRef.value?.error("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
  }
}

async function deleteOffer(id: number) {
  if (!confirm("আপনি কি নিশ্চিত এই অফারটি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/settings/company-offers/${id}`);
    toastRef.value?.success("অফার মুছে ফেলা হয়েছে");
    offersList.value = offersList.value.filter(o => o.id !== id);
  } catch (e: any) {
    toastRef.value?.error("মুছে ফেলতে ব্যর্থ হয়েছে");
  }
}

async function loadCustomerFees() {
  loadingFees.value = true;
  try {
    const res = await axios.get("/api/settings/customer-fees");
    feesList.value = res.data.data || [];
  } catch (e) {
    console.error("Failed to load customer fees", e);
  } finally {
    loadingFees.value = false;
  }
}

function openFeeModal(item?: any) {
  if (item) {
    editingFeeId.value = item.id;
    feeForm.transactionType = item.transactionType;
    feeForm.billerName = item.billerName || "";
    feeForm.feeType = item.feeType;
    feeForm.flatFee = Number(item.flatFee);
    feeForm.percentageFee = Number(item.percentageFee);
    feeForm.slabs = item.slabsJson && item.slabsJson.length ? JSON.parse(JSON.stringify(item.slabsJson)) : [{ min: 1, max: 1000, fee: 5 }];
  } else {
    editingFeeId.value = null;
    feeForm.transactionType = "পে-বিল";
    feeForm.billerName = "";
    feeForm.feeType = "flat";
    feeForm.flatFee = 10;
    feeForm.percentageFee = 0;
    feeForm.slabs = [{ min: 1, max: 1000, fee: 5 }, { min: 1001, max: 5000, fee: 10 }];
  }
  showFeeModal.value = true;
}

function closeFeeModal() {
  showFeeModal.value = false;
  editingFeeId.value = null;
}

function addSlabRow() {
  feeForm.slabs.push({ min: 0, max: 0, fee: 0 });
}

function removeSlabRow(index: number) {
  feeForm.slabs.splice(index, 1);
}

async function submitFee() {
  savingFee.value = true;
  try {
    const payload = {
      transactionType: feeForm.transactionType,
      billerName: feeForm.billerName || null,
      feeType: feeForm.feeType,
      flatFee: feeForm.flatFee,
      percentageFee: feeForm.percentageFee,
      slabsJson: feeForm.feeType === "slab" ? feeForm.slabs : null
    };

    if (editingFeeId.value) {
      await axios.put(`/api/settings/customer-fees/${editingFeeId.value}`, payload);
      toastRef.value?.success("ফি পলিসি সফলভাবে আপডেট হয়েছে");
    } else {
      await axios.post("/api/settings/customer-fees", payload);
      toastRef.value?.success("ফি পলিসি সফলভাবে তৈরি হয়েছে");
    }
    closeFeeModal();
    loadCustomerFees();
  } catch (e: any) {
    toastRef.value?.error(e?.response?.data?.message || "ফি পলিসি সংরক্ষণে ব্যর্থ হয়েছে");
  } finally {
    savingFee.value = false;
  }
}

async function toggleFee(fee: any) {
  try {
    await axios.patch(`/api/settings/customer-fees/${fee.id}/toggle`);
    fee.isActive = !fee.isActive;
    toastRef.value?.success("স্ট্যাটাস পরিবর্তন হয়েছে");
  } catch (e: any) {
    toastRef.value?.error("স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি");
  }
}

async function deleteFee(id: number) {
  if (!confirm("আপনি কি নিশ্চিত এই সার্ভিস ফি পলিসি মুছে ফেলতে চান?")) return;
  try {
    await axios.delete(`/api/settings/customer-fees/${id}`);
    toastRef.value?.success("ফি পলিসি মুছে ফেলা হয়েছে");
    feesList.value = feesList.value.filter(f => f.id !== id);
  } catch (e: any) {
    toastRef.value?.error("মুছে ফেলতে ব্যর্থ হয়েছে");
  }
}

onMounted(() => {
  loadCompanySettings();
  loadProviders();
  loadCompanyOffers();
  loadCustomerFees();
});
</script>

<style scoped>
.settings-page {
  font-family: inherit;
  width: 100%;
  max-width: 100%;
}

.btn-action {
  width: 32px;
  height: 32px;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem !important;
  font-size: 0.85rem;
}

@media (max-width: 767.98px) {
  .sh-header-actions {
    width: 100%;
    margin-top: 0.35rem;
  }
}

@media (max-width: 575.98px) {
  .card-header {
    padding: 0.85rem 1rem !important;
  }
  .card-body {
    padding: 1rem 0.85rem !important;
  }
  .sh-header-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch !important;
    gap: 0.5rem !important;
  }
  .sh-badge {
    flex: 1 1 calc(50% - 0.25rem);
    text-align: center;
    justify-content: center;
    font-size: 0.8rem !important;
    padding: 0 0.5rem !important;
    height: 32px !important;
  }
  .sh-add-btn {
    width: 100%;
    justify-content: center;
    height: 36px !important;
  }
  .btn-profile-action {
    width: 100%;
  }
}
</style>
