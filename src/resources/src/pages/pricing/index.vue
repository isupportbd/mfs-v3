<template>
  <div class="landing-page min-vh-100 d-flex flex-column">
    <!-- ১. স্টিকি নেভিগেশন বার (Glassmorphism Navbar) -->
    <header class="navbar navbar-expand-lg sticky-top landing-navbar py-2 px-3 px-lg-5">
      <div class="container-fluid max-w-7xl px-0">
        <!-- ব্র্যান্ড লোগো -->
        <router-link to="/pricing" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <img src="@/assets/images/logo.svg" alt="MFS Ledger Logo" class="brand-logo" />
          <span class="fs-4 fw-bold brand-text">MFS Ledger</span>
        </router-link>

        <!-- মোবাইল টগল বাটন -->
        <button
          class="navbar-toggler border-0 shadow-none px-2"
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          aria-label="Toggle navigation">
          <i class="bi" :class="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'" style="font-size: 1.5rem;"></i>
        </button>

        <!-- ন্যাভ আইটেমস ও অ্যাকশন বাটন -->
        <div class="collapse navbar-collapse" :class="{ show: isMobileMenuOpen }">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-3 py-2 py-lg-0 text-center">
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#features" @click="closeMobileMenu">সুবিধাসমূহ</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#plans" @click="closeMobileMenu">প্লান ও প্রাইসিং</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#why-us" @click="closeMobileMenu">কেন সেরা</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-medium" href="#faq" @click="closeMobileMenu">সাধারণ প্রশ্ন (FAQ)</a>
            </li>
          </ul>

          <div class="d-flex align-items-center justify-content-center gap-2 mt-3 mt-lg-0">
            <!-- থিম টগল বাটন -->
            <button
              class="btn btn-sm btn-icon rounded-circle theme-toggle-btn me-1"
              type="button"
              :title="ui.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              aria-label="Toggle Theme"
              @click="toggleTheme">
              <i class="bi" :class="ui.isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-secondary'"></i>
            </button>

            <!-- লগইন করা থাকলে ড্যাশবোর্ড বাটন, না থাকলে লগইন ও সাইনআপ বাটন -->
            <template v-if="auth.isAuthenticated">
              <router-link to="/" class="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-semibold">
                <i class="bi bi-speedometer2 me-1"></i>ড্যাশবোর্ড
              </router-link>
            </template>
            <template v-else>
              <router-link to="/login" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 fw-semibold">
                লগইন
              </router-link>
              <router-link to="/register" class="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-semibold shadow-sm">
                রেজিস্ট্রেশন
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- ২. হিরো সেকশন (Hero Section) -->
    <section class="hero-section py-5 position-relative overflow-hidden">
      <!-- ব্যাকগ্রাউন্ড গ্লো ইফেক্ট -->
      <div class="hero-glow position-absolute top-0 start-50 translate-middle-x"></div>

      <div class="container py-lg-4 text-center position-relative z-1">
        <!-- ব্যাজ -->
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 mb-4 rounded-pill hero-badge">
          <span class="badge bg-primary text-white rounded-pill px-2 py-1">নতুন</span>
          <span class="small fw-semibold">অল-ইন-ওয়ান MFS ও ব্যাংক লেজার প্ল্যাটফর্ম</span>
          <i class="bi bi-arrow-right text-primary"></i>
        </div>

        <!-- প্রধান শিরোনাম -->
        <h1 class="display-4 fw-extrabold mb-3 text-balance hero-title">
          ব্যবসায়ের প্রতিটি পয়সার নির্ভুল হিসাব<br class="d-none d-md-inline" />
          <span class="text-gradient">সবকিছু রাখুন এক নজরে</span>
        </h1>

        <!-- সাবটাইটেল -->
        <p class="lead text-muted max-w-2xl mx-auto mb-4 hero-subtitle">
          মার্চেন্ট, শপ ও এজেন্টদের জন্য আধুনিক মাল্টি-টেন্যান্ট ফাইন্যান্সিয়াল লেজার। 
          বিকাশ, নগদ, রকেট, উপায় ও যেকোনো ব্যাংকের ব্যালেন্স এবং দৈনিক লেনদেন ম্যানেজ করুন অতি সহজে।
        </p>

        <!-- অ্যাকশন বাটন -->
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-5">
          <a href="#plans" class="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-bold shadow-sm hero-cta-btn">
            <i class="bi bi-rocket-takeoff me-2"></i>৭ দিনের ফ্রি ট্রায়াল শুরু করুন
          </a>
          <a href="#features" class="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3 fw-semibold">
            <i class="bi bi-play-circle me-2"></i>সুবিধাসমূহ জানুন
          </a>
        </div>

        <!-- ট্রাস্ট পয়েন্ট ও বেনিফিট বাবল -->
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-4 text-muted small mb-5">
          <span class="d-flex align-items-center gap-1">
            <i class="bi bi-check-circle-fill text-success"></i> ৭ দিন ফ্রি ট্রায়াল
          </span>
          <span class="d-flex align-items-center gap-1">
            <i class="bi bi-check-circle-fill text-success"></i> কোনো ক্রেডিট কার্ড লাগবে না
          </span>
          <span class="d-flex align-items-center gap-1">
            <i class="bi bi-check-circle-fill text-success"></i> ইনস্ট্যান্ট অ্যাক্টিভেশন
          </span>
          <span class="d-flex align-items-center gap-1">
            <i class="bi bi-check-circle-fill text-success"></i> ২৪/৭ টেকনিক্যাল সাপোর্ট
          </span>
        </div>

        <!-- সাপোর্টেড প্রোভাইডার্স স্ট্রিপ (Supported Providers Badges) -->
        <div class="providers-strip py-3 px-4 rounded-4 mx-auto max-w-4xl border">
          <div class="small fw-semibold text-muted text-uppercase tracking-wider mb-3">
            সাপোর্টেড ওয়ালেট ও ব্যাংকিং প্রোভাইডার
          </div>
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4">
            <div class="provider-pill pill-bkash">
              <i class="bi bi-phone-fill me-1"></i>bKash (বিকাশ)
            </div>
            <div class="provider-pill pill-nagad">
              <i class="bi bi-wallet2 me-1"></i>Nagad (নগদ)
            </div>
            <div class="provider-pill pill-rocket">
              <i class="bi bi-lightning-charge-fill me-1"></i>Rocket (রকেট)
            </div>
            <div class="provider-pill pill-upay">
              <i class="bi bi-currency-exchange me-1"></i>Upay (উপায়)
            </div>
            <div class="provider-pill pill-bank">
              <i class="bi bi-bank me-1"></i>সকল বাণিজ্যিক ব্যাংক
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ৩. মূল ফিচারসমূহ (Features Grid) -->
    <section id="features" class="py-5 section-features border-top border-bottom">
      <div class="container py-lg-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 mb-2">
            শক্তিশালী সুবিধাসমূহ
          </span>
          <h2 class="fw-bold fs-2 mb-2">ব্যবসা পরিচালনায় যে কারণে আপনি এগিয়ে থাকবেন</h2>
          <p class="text-muted">খাতা-কলমের ঝামেলা বাদ দিয়ে ক্লাউড-বেজড আধুনিক অ্যাকাউন্টিংয়ে স্থানান্তরিত হোন।</p>
        </div>

        <div class="row g-4">
          <!-- ফিচার ১ -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-card h-100 p-4 rounded-4 border">
              <div class="feature-icon-wrapper mb-3 bg-primary-subtle text-primary">
                <i class="bi bi-wallet-fill"></i>
              </div>
              <h5 class="fw-bold mb-2">মাল্টি-অ্যাকাউন্ট সাপোর্ট</h5>
              <p class="text-muted small mb-0">
                একসাথে একাধিক বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্ট যুক্ত করুন এবং আলাদা ব্যালেন্স ট্র্যাকিং করুন।
              </p>
            </div>
          </div>

          <!-- ফিচার ২ -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-card h-100 p-4 rounded-4 border">
              <div class="feature-icon-wrapper mb-3 bg-success-subtle text-success">
                <i class="bi bi-arrow-left-right"></i>
              </div>
              <h5 class="fw-bold mb-2">রিয়েলটাইম লেজার ও ট্র্যাকিং</h5>
              <p class="text-muted small mb-0">
                ক্যাশ-ইন, ক্যাশ-আউট, সেন্ড মানি বা পেমেন্টের প্রতিটি এন্ট্রি স্বয়ংক্রিয়ভাবে লেজারে সেভ হয়ে ব্যালেন্স আপডেট করে।
              </p>
            </div>
          </div>

          <!-- ফিচার ৩ -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-card h-100 p-4 rounded-4 border">
              <div class="feature-icon-wrapper mb-3 bg-warning-subtle text-warning">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5 class="fw-bold mb-2">সুরক্ষা ও রোল পারমিশন</h5>
              <p class="text-muted small mb-0">
                অ্যাডমিন, ম্যানেজার ও ক্যাশিয়ারের জন্য পৃথক অ্যাকাউন্ট। অডিট ট্রেইলের মাধ্যমে প্রতিটি লেনদেনের ট্র্যাকিং।
              </p>
            </div>
          </div>

          <!-- ফিচার ৪ -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="feature-card h-100 p-4 rounded-4 border">
              <div class="feature-icon-wrapper mb-3 bg-info-subtle text-info">
                <i class="bi bi-file-earmark-bar-graph"></i>
              </div>
              <h5 class="fw-bold mb-2">স্টেটমেন্ট ও প্রফিট রিপোর্ট</h5>
              <p class="text-muted small mb-0">
                এক ক্লিকে দৈনিক, সাপ্তাহিক বা মাসিক রিপোর্ট তৈরি ও পিডিএফ/এক্সেলে ডাউনলোড করার সুবিধা।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ৪. সাবস্ক্রিপশন প্লান সেকশন (Subscription Plans Section) -->
    <section id="plans" class="py-5 section-plans position-relative">
      <div class="container py-lg-4">
        <!-- সেকশন হেডার -->
        <div class="text-center max-w-2xl mx-auto mb-4">
          <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 mb-2">
            সাশ্রয়ী সাবস্ক্রিপশন
          </span>
          <h2 class="fw-bold fs-2 mb-2">আপনার ব্যবসার জন্য সঠিক প্লান বেছে নিন</h2>
          <p class="text-muted">প্রতিটি প্লানে রয়েছে সম্পূর্ণ ৭ দিনের ফ্রি ট্রায়াল। যেকোনো সময় বাতিল বা আপগ্রেডযোগ্য।</p>

          <!-- মান্থলি / ইয়ারলি টগল সুইচ -->
          <div class="billing-toggle-container d-inline-flex align-items-center p-1 rounded-pill mt-3 border">
            <button
              type="button"
              class="btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all"
              :class="!isYearly ? 'btn-primary shadow-sm' : 'btn-ghost text-muted'"
              @click="isYearly = false">
              মাসিক বিল
            </button>
            <button
              type="button"
              class="btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all"
              :class="isYearly ? 'btn-primary shadow-sm' : 'btn-ghost text-muted'"
              @click="isYearly = true">
              বাৎসরিক বিল
              <span v-if="maxDiscountPercentage > 0" class="badge bg-warning text-dark rounded-pill ms-1 fw-bold">
                {{ maxDiscountPercentage }}% পর্যন্ত ছাড়
              </span>
            </button>
          </div>
        </div>

        <!-- লোডিং অবস্থা -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading plans...</span>
          </div>
          <p class="text-muted mt-2 small">প্লান লোড হচ্ছে...</p>
        </div>

        <!-- খালি অবস্থা (যদি ডাটাবেজে কোনো প্লান না থাকে) -->
        <div v-else-if="displayPlans.length === 0" class="text-center py-5">
          <div class="mb-3 text-muted">
            <i class="bi bi-box-seam" style="font-size: 3rem;"></i>
          </div>
          <h5 class="fw-bold text-muted">বর্তমানে কোনো সক্রিয় সাবস্ক্রিপশন প্লান নেই</h5>
          <p class="text-muted small">সুপারএডমিন ড্যাশবোর্ড থেকে নতুন প্লান তৈরি করা হলে এখানে প্রদর্শিত হবে।</p>
        </div>

        <!-- প্লান কার্ড গ্রিড -->
        <div v-else class="row g-4 justify-content-center align-items-stretch">
          <div
            v-for="plan in displayPlans"
            :key="plan.id"
            class="col-12 col-md-6 col-lg-4">
            <div
              class="pricing-card h-100 p-4 p-xl-5 rounded-4 border d-flex flex-column justify-content-between position-relative"
              :class="{ 'featured-plan': plan.isPopular }">
              
              <!-- পপুলার ব্যাজ -->
              <div v-if="plan.isPopular" class="popular-ribbon position-absolute top-0 start-50 translate-middle">
                <span class="badge bg-primary text-white rounded-pill px-3 py-1 shadow-sm fw-bold">
                  <i class="bi bi-star-fill me-1"></i>জনপ্রিয় পছন্দ
                </span>
              </div>

              <!-- কার্ডের শীর্ষভাগ: নাম ও মূল্য -->
              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="fw-bold mb-0">{{ plan.name }}</h4>
                  <span class="badge bg-light text-secondary border">
                    {{ plan.durationDays }} দিন
                  </span>
                </div>

                <p class="text-muted small mb-4 min-h-desc">
                  {{ plan.description || getDefaultDesc(plan.name) }}
                </p>

                <!-- মূল্য ডিসপ্লে -->
                <div class="price-box mb-4 pb-3 border-bottom">
                  <div class="d-flex align-items-baseline">
                    <span class="fs-4 fw-bold me-1">৳</span>
                    <span class="display-5 fw-extrabold">{{ getCalculatedPrice(plan) }}</span>
                    <span class="text-muted ms-2 small">/ {{ isYearly ? 'বছর' : 'মাস' }}</span>
                  </div>
                  <!-- বাৎসরিক ছাড়ের নোটিশ -->
                  <div v-if="isYearly && Number(plan.yearlyDiscount) > 0" class="small text-success mt-1">
                    <i class="bi bi-tag-fill me-1"></i>{{ plan.yearlyDiscount }}% বাৎসরিক ছাড় অন্তর্ভুক্ত
                    <span class="text-muted text-decoration-line-through ms-1">৳{{ (Number(plan.price) * 12).toFixed(0) }}</span>
                  </div>
                  <div v-else class="small text-muted mt-1">
                    বিলিং চক্র: প্রতি {{ isYearly ? '১২ মাস' : 'মাস' }}
                  </div>
                </div>

                <!-- ফিচারের তালিকা -->
                <ul class="list-unstyled mb-4 plan-features">
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>
                      <strong>{{ plan.maxMfsAccounts ? `${plan.maxMfsAccounts}টি` : 'আনলিমিটেড' }}</strong> MFS ওয়ালেট অ্যাকাউন্ট
                    </span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>
                      <strong>আনলিমিটেড</strong> লেনদেন ট্র্যাকিং
                      <small v-if="plan.maxTransactions && Number(plan.maxTransactions) > 0" class="text-muted ms-1">
                        (ট্রায়ালে {{ Number(plan.maxTransactions).toLocaleString() }}টি)
                      </small>
                    </span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>বিকাশ, নগদ, রকেট ও উপায় ইন্টিগ্রেশন</span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>বাণিজ্যিক ব্যাংক অ্যাকাউন্ট ট্র্যাকিং</span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>রিয়েল-টাইম দৈনিক লেজার ও ব্যালেন্স</span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>দৈনিক/মাসিক লেনদেন অডিট রিপোর্ট</span>
                  </li>
                  <li class="d-flex align-items-center mb-2 text-start">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>৭ দিনের পূর্ণ ফিচারযুক্ত ফ্রি ট্রায়াল</span>
                  </li>
                </ul>
              </div>

              <!-- কার্ডের বটম: অ্যাকশন বাটন -->
              <div>
                <button
                  type="button"
                  class="btn w-100 py-3 rounded-pill fw-bold transition-all"
                  :class="plan.isPopular ? 'btn-primary shadow' : 'btn-outline-primary'"
                  @click="selectPlan(plan)">
                  <i class="bi bi-arrow-right-circle me-1"></i>প্লানটি বেছে নিন (৭ দিন ফ্রি)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ট্রায়াল নোট -->
        <div class="text-center mt-5 text-muted small">
          <i class="bi bi-info-circle me-1"></i>
          সকল নতুন রেজিস্ট্রেশনে স্বয়ংক্রিয়ভাবে ৭ দিনের ফ্রি ট্রায়াল কার্যকর হবে। ট্রায়াল চলাকালীন কোনো চার্জ কাটা হবে না।
        </div>
      </div>
    </section>

    <!-- ৫. কীভাবে কাজ করে (How It Works) -->
    <section id="why-us" class="py-5 section-how-it-works border-top">
      <div class="container py-lg-4">
        <div class="text-center max-w-2xl mx-auto mb-5">
          <span class="badge bg-secondary-subtle text-secondary border rounded-pill px-3 py-1 mb-2">
            সহজ ৩টি ধাপ
          </span>
          <h2 class="fw-bold fs-2 mb-2">কীভাবে শুরু করবেন?</h2>
          <p class="text-muted">মাত্র কয়েক মিনিটেই আপনার সম্পূর্ণ ফাইন্যান্সিয়াল লেজার প্রস্তুত হয়ে যাবে।</p>
        </div>

        <div class="row g-4 text-center">
          <div class="col-12 col-md-4">
            <div class="step-card p-4 rounded-4 border h-100">
              <div class="step-number mb-3">১</div>
              <h5 class="fw-bold mb-2">রেজিস্ট্রেশন করুন</h5>
              <p class="text-muted small mb-0">
                আপনার ব্যবসায়ের নাম ও ইমেইল দিয়ে এক মিনিটে ফ্রি একাউন্ট তৈরি করুন।
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="step-card p-4 rounded-4 border h-100">
              <div class="step-number mb-3">২</div>
              <h5 class="fw-bold mb-2">অ্যাকাউন্ট যুক্ত করুন</h5>
              <p class="text-muted small mb-0">
                আপনার বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্টগুলো প্ল্যাটফর্মে যুক্ত করুন।
              </p>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="step-card p-4 rounded-4 border h-100">
              <div class="step-number mb-3">৩</div>
              <h5 class="fw-bold mb-2">নিখুঁত হিসাব রাখুন</h5>
              <p class="text-muted small mb-0">
                লেনদেন ট্র্যাক করুন, ক্যাশফ্লো মনিটর করুন এবং লাভ-ক্ষতির পূর্ণ রিপোর্ট দেখুন।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ৬. সাধারণ প্রশ্নোত্তর (FAQ) -->
    <section id="faq" class="py-5 section-faq border-top">
      <div class="container py-lg-4 max-w-3xl">
        <div class="text-center mb-5">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 mb-2">
            প্রশ্নোত্তর
          </span>
          <h2 class="fw-bold fs-2 mb-2">সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</h2>
          <p class="text-muted">আপনার মনের যেকোনো সাধারণ প্রশ্নের সহজ উত্তর এখানে পেয়ে যাবেন।</p>
        </div>

        <div class="accordion custom-accordion" id="faqAccordion">
          <!-- প্রশ্ন ১ -->
          <div class="accordion-item border rounded-3 mb-3 overflow-hidden">
            <h2 class="accordion-header" id="headingOne">
              <button
                class="accordion-button fw-semibold shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne">
                ফ্রি ট্রায়াল কীভাবে কাজ করে?
              </button>
            </h2>
            <div
              id="collapseOne"
              class="accordion-collapse collapse show"
              aria-labelledby="headingOne"
              data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted small">
                রেজিস্ট্রেশন করার সাথে সাথেই আপনি নির্বাচিত প্লানের সকল ফিচার ৭ দিনের জন্য সম্পূর্ণ বিনামূল্যে ব্যবহার করতে পারবেন। ট্রায়াল মেয়াদে কোনো পেমেন্ট তথ্যের প্রয়োজন হয় না।
              </div>
            </div>
          </div>

          <!-- প্রশ্ন ২ -->
          <div class="accordion-item border rounded-3 mb-3 overflow-hidden">
            <h2 class="accordion-header" id="headingTwo">
              <button
                class="accordion-button collapsed fw-semibold shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo">
                আমার ডেটা এবং আর্থিক তথ্য কতটা সুরক্ষিত?
              </button>
            </h2>
            <div
              id="collapseTwo"
              class="accordion-collapse collapse"
              aria-labelledby="headingTwo"
              data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted small">
                MFS Ledger এ সম্পূর্ণ ডাটাবেজ লেভেলে এন্টারপ্রাইজ গ্রেড এনক্রিপশন ও সিকিউর সেশন ব্যবহার করা হয়। আপনার কোনো ওটিপি (OTP) বা পিন (PIN) কোথাও সংরক্ষিত হয় না; শুধুমাত্র ব্যালেন্স ও লেজার স্টেটমেন্ট হিসাব সুরক্ষিত রাখা হয়।
              </div>
            </div>
          </div>

          <!-- প্রশ্ন ৩ -->
          <div class="accordion-item border rounded-3 mb-3 overflow-hidden">
            <h2 class="accordion-header" id="headingThree">
              <button
                class="accordion-button collapsed fw-semibold shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree">
                পরবর্তীতে কি প্লান আপগ্রেড বা পরিবর্তন করা যাবে?
              </button>
            </h2>
            <div
              id="collapseThree"
              class="accordion-collapse collapse"
              aria-labelledby="headingThree"
              data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted small">
                হ্যাঁ, আপনি যেকোনো সময় বেসিক থেকে বিজনেস বা এন্টারপ্রাইজ প্লানে সরাসরি আপগ্রেড করতে পারবেন। বাড়তি অ্যাকাউন্ট সংখ্যা তাৎক্ষণিকভাবে যুক্ত হয়ে যাবে।
              </div>
            </div>
          </div>

          <!-- প্রশ্ন ৪ -->
          <div class="accordion-item border rounded-3 mb-3 overflow-hidden">
            <h2 class="accordion-header" id="headingFour">
              <button
                class="accordion-button collapsed fw-semibold shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseFour"
                aria-expanded="false"
                aria-controls="collapseFour">
                সাবস্ক্রিপশন ফি কীভাবে পরিশোধ করব?
              </button>
            </h2>
            <div
              id="collapseFour"
              class="accordion-collapse collapse"
              aria-labelledby="headingFour"
              data-bs-parent="#faqAccordion">
              <div class="accordion-body text-muted small">
                আপনি বিকাশ, নগদ, রকেট বা সরাসরি ব্যাংক ট্রান্সফারের মাধ্যমে সহজেই সাবস্ক্রিপশন ফি পরিশোধ করতে পারেন। ট্রানজেকশন আইডি প্রদান করার পর সুপারএডমিন দ্রুত অ্যাকাউন্ট সক্রিয় করে দেবেন।
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ৭. বটম কল-টু-অ্যাকশন ব্যানার (Bottom CTA Banner) -->
    <section class="py-5 bottom-cta-section border-top">
      <div class="container py-4">
        <div class="cta-box p-4 p-md-5 rounded-4 text-center text-white position-relative overflow-hidden">
          <div class="position-relative z-1 max-w-2xl mx-auto">
            <h2 class="display-6 fw-bold mb-3">আপনার ব্যবসায়ের আর্থিক হিসাব ডিজিটাল করতে প্রস্তুত?</h2>
            <p class="lead opacity-90 mb-4">
              আজই শুরু করুন ৭ দিনের ফ্রি ট্রায়াল। কোনো প্রকার ক্রেডিট কার্ডের ঝামেলা ছাড়াই।
            </p>
            <router-link to="/register" class="btn btn-light btn-lg rounded-pill px-4 py-3 fw-bold shadow">
              <i class="bi bi-box-arrow-in-right me-2 text-primary"></i>বিনামূল্যে একাউন্ট তৈরি করুন
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ৮. ফুটার (Footer) -->
    <footer class="landing-footer py-4 border-top mt-auto">
      <div class="container max-w-7xl d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-muted small">
        <div class="d-flex align-items-center gap-2">
          <img src="@/assets/images/logo.svg" alt="MFS Ledger Logo" style="width: 24px; height: 30px; object-fit: contain;" />
          <span class="fw-bold">MFS Ledger</span>
          <span>© 2026. সর্বস্বত্ব সংরক্ষিত।</span>
        </div>
        <div class="d-flex align-items-center gap-4">
          <a href="#features" class="text-decoration-none text-muted">সুবিধাসমূহ</a>
          <a href="#plans" class="text-decoration-none text-muted">প্লানসমূহ</a>
          <router-link to="/login" class="text-decoration-none text-muted">লগইন</router-link>
          <router-link to="/register" class="text-decoration-none text-muted">রেজিস্ট্রেশন</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { useHead } from "@vueuse/head";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminUiStore } from "@/stores/admin-ui";
import { useAuthStore } from "@/stores/auth";

useHead({
  title: "Pricing & Plans - MFS Ledger",
  meta: [
    {
      name: "description",
      content: "MFS Ledger এর সাশ্রয়ী সাবস্ক্রিপশন প্লানসমূহ দেখুন। বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্ট পরিচালনার জন্য সেরা ফাইন্যান্সিয়াল প্ল্যাটফর্ম।"
    }
  ]
});

const router = useRouter();
const auth = useAuthStore();
const ui = useAdminUiStore();

const isMobileMenuOpen = ref(false);
const isYearly = ref(false);
const loading = ref(false);

interface PlanItem {
  id: number;
  name: string;
  description?: string;
  price: string;
  durationDays: number;
  yearlyDiscount: string;
  maxMfsAccounts?: number | null;
  maxTransactions?: number | null;
  isActive: boolean;
}

const rawPlans = ref<PlanItem[]>([]);

const displayPlans = computed(() => {
  return rawPlans.value
    .filter((p) => p.isActive)
    .map((plan) => ({
      ...plan,
      isPopular: plan.name.toLowerCase().includes("business") || plan.name.toLowerCase().includes("pro")
    }));
});

const maxDiscountPercentage = computed(() => {
  const discounts = displayPlans.value.map((p) => Number(p.yearlyDiscount) || 0);
  return discounts.length > 0 ? Math.max(...discounts) : 0;
});

function getDefaultDesc(name: string): string {
  const lower = (name || "").toLowerCase();
  if (lower.includes("basic") || lower.includes("starter")) {
    return "ছোট দোকান বা একক উদ্যোক্তাদের জন্য উপযুক্ত।";
  }
  if (lower.includes("business") || lower.includes("standard")) {
    return "বিকাশ ও নগদ দুটোই যাদের নিয়মিত লেনদেন করতে হয়।";
  }
  return "বড় ব্যবসা বা এজেন্সির জন্য আনলিমিটেড অ্যাকাউন্ট সুবিধা।";
}

function getCalculatedPrice(plan: PlanItem): string {
  const monthly = Number(plan.price) || 0;
  if (!isYearly.value) {
    return monthly.toFixed(0);
  }
  const discountPercent = Number(plan.yearlyDiscount) || 0;
  const annualStandard = monthly * 12;
  const discounted = annualStandard * (1 - discountPercent / 100);
  return discounted.toFixed(0);
}

function selectPlan(plan: PlanItem) {
  router.push({
    path: "/register",
    query: {
      plan: plan.id,
      billing: isYearly.value ? "yearly" : "monthly"
    }
  });
}

function toggleTheme() {
  ui.toggleTheme();
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

async function fetchPlans() {
  loading.value = true;
  try {
    const res = await axios.get("/api/subscription");
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) {
      rawPlans.value = data;
    }
  } catch (_e) {
    // ফলব্যাক লোকাল প্লান ব্যবহৃত হবে
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  ui.initTheme();
  fetchPlans();
});

onBeforeUnmount(() => {
  ui.cleanupTheme();
});
</script>

<style lang="scss" scoped>
.landing-page {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  font-family: inherit;
}

.max-w-7xl {
  max-width: 1240px;
}

.max-w-4xl {
  max-width: 900px;
}

.max-w-3xl {
  max-width: 760px;
}

.max-w-2xl {
  max-width: 640px;
}

.brand-logo {
  width: 32px;
  height: 40px;
  object-fit: contain;
}

.landing-navbar {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--bs-body-bg) 85%, transparent);
  border-bottom: 1px solid var(--bs-border-color);
  z-index: 1030;
}

.theme-toggle-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bs-tertiary-bg);
  }
}

.hero-section {
  position: relative;
  background: radial-gradient(circle at 50% 10%, color-mix(in srgb, var(--bs-primary) 12%, transparent) 0%, transparent 70%);
}

.hero-glow {
  width: 600px;
  height: 300px;
  background: radial-gradient(circle, color-mix(in srgb, var(--bs-primary) 18%, transparent) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

.hero-badge {
  background: color-mix(in srgb, var(--bs-primary) 10%, var(--bs-body-bg));
  border: 1px solid color-mix(in srgb, var(--bs-primary) 25%, transparent);
}

.text-gradient {
  background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.providers-strip {
  background: color-mix(in srgb, var(--bs-body-bg) 90%, var(--bs-tertiary-bg));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.provider-pill {
  padding: 0.4rem 0.85rem;
  border-radius: 50rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.pill-bkash {
  background: rgba(226, 19, 110, 0.12);
  color: #e2136e;
  border: 1px solid rgba(226, 19, 110, 0.25);
}

.pill-nagad {
  background: rgba(247, 148, 29, 0.12);
  color: #ea580c;
  border: 1px solid rgba(247, 148, 29, 0.25);
}

.pill-rocket {
  background: rgba(140, 43, 143, 0.12);
  color: #9333ea;
  border: 1px solid rgba(140, 43, 143, 0.25);
}

.pill-upay {
  background: rgba(0, 114, 187, 0.12);
  color: #0284c7;
  border: 1px solid rgba(0, 114, 187, 0.25);
}

.pill-bank {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.feature-card {
  background: var(--bs-body-bg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  }
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.billing-toggle-container {
  background: var(--bs-tertiary-bg);
}

.pricing-card {
  background: var(--bs-body-bg);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }

  &.featured-plan {
    border-color: var(--bs-primary) !important;
    border-width: 2px !important;
    box-shadow: 0 10px 30px color-mix(in srgb, var(--bs-primary) 20%, transparent);
  }
}

.popular-ribbon {
  z-index: 2;
}

.min-h-desc {
  min-height: 42px;
}

.plan-features li {
  font-size: 0.9rem;
}

.step-card {
  background: var(--bs-body-bg);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.step-number {
  width: 42px;
  height: 42px;
  line-height: 42px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--bs-primary);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
}

.cta-box {
  background: linear-gradient(135deg, #0d6efd 0%, #0284c7 100%);
  box-shadow: 0 12px 35px rgba(13, 110, 253, 0.25);
}

.landing-footer {
  background: color-mix(in srgb, var(--bs-body-bg) 95%, var(--bs-tertiary-bg));
}
</style>
