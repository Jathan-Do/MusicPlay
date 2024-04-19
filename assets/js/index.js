const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "PLAYER_STORAGE";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const playList = $(".playlist");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const volBtn = $(".btn-volume");
const volBar = $(".volume-bar");
const iconMute = $(".icon-mute");
const iconUnmute = $(".icon-unmute");

const app = {
    currentIndex: 0,
    currVol: 1,
    lockVol: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs: [
        {
            name: "Biên Giới Long Bình",
            singer: "Obito",
            path: "./assets/music/BienGioiLongBinh-Obito-11836721.mp3",
            image: "./assets/image/obito.jpg",
        },
        {
            name: "Đánh Đổi",
            singer: "Obito",
            path: "./assets/music/DanhDoi-Obito-11836728.mp3",
            image: "./assets/image/obito.jpg",
        },
        {
            name: "Nhắn Nhủ",
            singer: "Ronboogz",
            path: "./assets/music/NhanNhu-Ronboogz-12896660.mp3",
            image: "./assets/image/Ronboo.jpg",
        },
        {
            name: "Trốn Chạy",
            singer: "Obito",
            path: "./assets/music/TronChay-Obito-11836724.mp3",
            image: "./assets/image/obito.jpg",
        },
        {
            name: "WrongTimes",
            singer: "Puppy",
            path: "./assets/music/WrongTimes-PuppyVietNamDangrangto-9475978.mp3",
            image: "./assets/image/Wrongtime.jpg",
        },
        {
            name: "Xuất Phát Điểm",
            singer: "Obito",
            path: "./assets/music/XuatPhatDiem-Obito-11836718.mp3",
            image: "./assets/image/obito.jpg",
        },
    ],

    //Render playlist
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });

        playList.innerHTML = htmls.join("");
    },

    //Khởi tạo thuộc tính mặc định
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    //Xử lí các sự kiện
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this; //lấy ra đối tượng this parent

        //Xử lí quay CD
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
            duration: 15000, //15seconds
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        //phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        //Xử lí khi click Play btn
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        //Khi bài hát được phát
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        //Khi bài hát được dừng
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        //Lấy ra tiến độ bài hát
        audio.ontimeupdate = function () {
            //khác NaN
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        };

        //Xử lí khi tua bài hát
        progress.onchange = function () {
            const seekTime = audio.duration * (progress.value / 100);
            audio.currentTime = seekTime;
        };

        //Xử lí khi click next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        //Xử lí khi click prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        //Xử lí khi click random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        //Xử lí lặp lại bài
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        //Xử lí chuyển bài khi hết bài hát
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        //xử lí click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    $(".song.active").classList.remove("active");
                    $$(".song")[_this.currentIndex].classList.add("active");
                    _this.loadCurrentSong();
                    audio.play();
                }
            }
        };

        //Volume-Bar
        volBar.oninput = (e) => {
            _this.setConfig("currVol", e.target.value);
            audio.volume = volBar.value;
        };

        if (_this.currVol > 0) {
            volBar.value = _this.currVol;
            audio.volume = _this.currVol;
            iconUnmute.style.visibility = "visible";
            iconMute.style.visibility = "hidden";
        } else {
            volBar.value = 0;
            audio.volume = 0;
            iconUnmute.style.visibility = "hidden";
            iconMute.style.visibility = "visible";
        }

        //Change-Volume
        audio.onvolumechange = () => {
            volBar.value = audio.volume;
            if (audio.volume === 0) {
                iconMute.style.visibility = "visible";
                iconUnmute.style.visibility = "hidden";
            } else {
                iconMute.style.visibility = "hidden";
                iconUnmute.style.visibility = "visible";
            }
        };

        //Unmute-Volume
        iconUnmute.onclick = () => {
            _this.setConfig("lockVol", audio.volume);
            audio.volume = 0;
            _this.setConfig("currVol", audio.volume);
        };

        //Mute-Volume 
        iconMute.onclick = () => {
            audio.volume = this.config.lockVol;
            _this.setConfig("currVol", audio.volume);
        };
    },

    //Tải bài hát
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    //Next song
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    //Prev song
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    //Random song
    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    //Scroll active song
    scrollActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
            });
        }, 100);
    },

    //Config
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
