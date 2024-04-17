const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");

const app = {
    currentIndex: 0,
    isPlaying: false,
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
        const htmls = this.songs.map((song) => {
            return `
                <div class="song">
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

        $(".playlist").innerHTML = htmls.join("");
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
        progress.onchange = function (e) {
            const seekTime = audio.duration * (progress.value / 100);
            audio.currentTime = seekTime;
        };
    },

    //Tải bài hát đầu tiên
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    start: function () {
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
    },
};

app.start();
