var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommentaryUtils } from "./utils.js";
import { users, mockData } from "./mock.js";
const commentaryUtils = new CommentaryUtils();
class CommentarySystem {
    constructor() {
        this.parentId = null;
        this.commentLengthCheck = true;
        this.commentNotEmptyCheck = false;
        this.sortKey = "commentTimestamp";
        this.sortAsc = false;
        this.users = users;
        this.user = { userId: "u4", userName: "Максим Авдеенко" };
        this.showLike = false;
        this.sortKeys = [
            { sortKey: "commentTimestamp", title: "По дате" },
            { sortKey: "raters", title: "По количеству оценок" },
            { sortKey: "answers", title: "По количеству ответов" },
            { sortKey: "rating", title: "По рейтингу" },
        ];
        this.likeIcons = {
            true: { text: "В избранном", src: "/img/likedComment.svg" },
            false: { text: "В избранное", src: "/img/likeComment.svg" },
        };
        this.sortIcons = {
            true: { src: "/img/arrow-up.svg" },
            false: { src: "/img/arrow-down.svg" },
        };
        this.mockData = mockData;
        this.startApp();
    }
    startApp() {
        return __awaiter(this, void 0, void 0, function* () {
            const photos = yield this.getUsersPhoto();
            this.usersPhoto = photos;
            this.drawApp();
        });
    }
    drawApp() {
        this.html = document.querySelector("html");
        this.commentSection = document.createElement("div");
        this.commentSection.classList.add("comment-section");
        this.form = this.createForm();
        this.textArea = this.form.querySelector("textarea");
        this.sendBtn = this.form.querySelector(".comment__send-btn");
        this.textLimitElement = this.form.querySelector(".comment__text-limit");
        this.textLimitErrorElement = this.form.querySelector(".comment__send-btn-error");
        this.actions = this.createActionsBlock();
        this.commentCounter = this.actions.querySelector(".comment__counter");
        this.sorterElement = this.actions.querySelector(".comment-actions__sorter");
        this.sortTextElement =
            this.sorterElement.querySelector(".comment-sort-text");
        this.initSorterEvents();
        this.sortIconElement = this.actions.querySelector(".comment-asc-desc");
        this.onclickSortIcon();
        this.showLikeToggler = this.actions.querySelector(".show-liked");
        this.onclickLikeToggler();
        this.commentListElement = this.createCommentList();
        this.sortListElement = this.createSortList();
        this.appendCommentElements();
        this.initDefaultComments();
        this.sortComments();
        this.setCommentCounter();
        this.resetCommentType();
        this.textArea.oninput = (e) => {
            this.handleComment(this.textArea.value);
        };
        this.initSendBtn();
        this.initResizableTextArea();
        document.querySelector(".content").appendChild(this.commentSection);
    }
    initSorterEvents() {
        this.sortTextElement.onclick = (event) => {
            this.setSorterPosition();
            this.setSorterVisibility();
            event.stopPropagation();
        };
        window.onresize = () => {
            this.setSorterPosition();
        };
        window.onscroll = () => {
            this.setSorterPosition();
        };
    }
    setSorterPosition() {
        const sorterRect = this.sorterElement.getBoundingClientRect();
        const sortListElementTop = sorterRect.y + sorterRect.height + 15 + this.html.scrollTop;
        this.sortListElement.style.top = `${sortListElementTop}px`;
        this.sortListElement.style.left = `${sorterRect.x}px`;
    }
    setSorterVisibility() {
        this.sortListElement.classList.toggle("visible");
    }
    onclickSortIcon() {
        this.sortIconElement.onclick = () => {
            this.sortAsc = !this.sortAsc;
            const iconKey = this.sortAsc.toString();
            this.sortIconElement.src = this.sortIcons[iconKey].src;
            this.sortComments();
        };
    }
    appendCommentElements() {
        const formWrap = document.createElement("div");
        formWrap.classList.add("comment__form-wrap");
        formWrap.appendChild(this.actions);
        formWrap.appendChild(this.form);
        this.commentSection.appendChild(formWrap);
        this.commentSection.appendChild(this.commentListElement);
        this.commentSection.appendChild(this.sortListElement);
    }
    resetCommentType() {
        this.parentId = "";
        this.commentType = "comment";
    }
    initDefaultComments() {
        var _a;
        this.comments =
            (_a = JSON.parse(localStorage.getItem("comments"))) !== null && _a !== void 0 ? _a : this.mockData;
    }
    initSendBtn() {
        this.sendBtn.onclick = (e) => {
            this.checkAndPublic();
        };
        this.textArea.onkeydown = (e) => {
            if (e.code === "Enter") {
                this.checkAndPublic();
            }
        };
    }
    checkAndPublic() {
        if (this.commentSendCheck()) {
            this.publicComment();
        }
    }
    setCommentCounter() {
        var _a;
        this.counter = (_a = this.comments.length) !== null && _a !== void 0 ? _a : 0;
        this.commentCounter.innerHTML = `(${this.counter})`;
    }
    sortComments(key = this.sortKey, ascDesc = this.sortAsc) {
        this.sortKey = key ? key : this.sortKey;
        this.sortAsc = ascDesc ? ascDesc : this.sortAsc;
        const shownComments = this.sortAndFilterComments();
        this.clearCommentList();
        this.renderComments(shownComments);
    }
    sortAndFilterComments() {
        let shownComments = this.filterLikedComments();
        if (this.sortAsc === true) {
            if (["raters", "answers"].includes(this.sortKey)) {
                shownComments.sort((a, b) => a[this.sortKey].length - b[this.sortKey].length);
            }
            else {
                shownComments.sort((a, b) => a[this.sortKey] - b[this.sortKey]);
            }
        }
        else {
            if (this.sortKey === "raters" || this.sortKey === "answers") {
                shownComments.sort((a, b) => b[this.sortKey].length - a[this.sortKey].length);
            }
            else {
                shownComments.sort((a, b) => b[this.sortKey] - a[this.sortKey]);
            }
        }
        return shownComments;
    }
    renderComments(comments) {
        const comm = comments.filter((c) => c.commentType === "comment");
        const answ = comments.filter((c) => c.commentType === "answer");
        comm.forEach((c) => {
            this.renderComment(c);
        });
        answ.forEach((a) => {
            this.renderComment(a);
        });
    }
    handleComment(commentText, maxlimit = 1000) {
        this.commentText = String(commentText).trim();
        const textLimit = `Макс. ${maxlimit} символов`;
        this.commentNotEmptyCheck =
            this.commentText.trim().length === 0 ? false : true;
        if (this.commentText.length > 0) {
            this.textLimitElement.innerHTML = `${this.commentText.length} / ${maxlimit}`;
            this.commentNotEmptyCheck = true;
        }
        else {
            this.commentNotEmptyCheck = false;
            this.textLimitElement.innerHTML = textLimit;
        }
        if (this.commentText.length > maxlimit) {
            this.textLimitErrorElement.innerHTML = "Слишком длинное сообщение";
            this.commentLengthCheck = false;
        }
        else {
            this.commentLengthCheck = true;
            this.textLimitErrorElement.innerHTML = "";
        }
        this.handleSendBtn();
    }
    handleSendBtn() {
        if (this.commentSendCheck()) {
            this.activateBtn();
        }
        else {
            this.deActivateBtn();
        }
    }
    activateBtn() {
        this.sendBtn.classList.add("active");
    }
    deActivateBtn() {
        this.sendBtn.classList.remove("active");
    }
    commentSendCheck() {
        return this.commentLengthCheck && this.commentNotEmptyCheck;
    }
    publicComment() {
        const dt = new Date();
        const date = commentaryUtils.twoDigitDatePart(dt.getDate());
        const month = ("0" + (dt.getMonth() + 1)).slice(-2);
        const hours = commentaryUtils.twoDigitDatePart(dt.getHours());
        const minutes = commentaryUtils.twoDigitDatePart(dt.getMinutes());
        const commentTime = `${date}.${month} ${hours}:${minutes}`;
        const commentId = commentaryUtils.makeString(5);
        const comment = {
            id: commentId,
            text: this.commentText,
            userId: this.user.userId,
            userName: this.user.userName,
            commentTime: commentTime,
            commentTimestamp: Math.floor(Date.now() / 1000),
            commentType: this.commentType,
            parentId: this.parentId,
            rating: 0,
            raters: [],
            answers: [],
            like: false,
        };
        this.addComment(comment);
        if (this.commentType === "answer") {
            const parentComment = this.comments[this.getCommentIndex(this.parentId)];
            parentComment.answers.push(comment.id);
        }
        this.saveComments();
        this.resetTextArea();
        this.setCommentCounter();
        this.sortComments();
        this.scrollToAddedComment(commentId);
    }
    addComment(comment) {
        this.comments.push(comment);
    }
    saveComments() {
        localStorage.setItem("comments", JSON.stringify(this.comments));
    }
    initResizableTextArea() {
        function OnInput() {
            this.style.height = 0;
            this.style.height = this.scrollHeight + "px";
        }
        this.textArea.setAttribute("style", "height:" + this.textArea.scrollHeight + "px;overflow-y:hidden;");
        this.textArea.addEventListener("input", OnInput, false);
    }
    resetTextArea() {
        this.commentText = "";
        this.textArea.value = "";
        this.textArea.style.height = "auto";
        this.resetCommentType();
        this.setAnsweredAuthor("");
        this.handleComment(this.commentText);
    }
    returnDisabledRateBtn(rater, value) {
        return rater !== undefined && rater !== null && rater.rateState === value
            ? "rate-disabled"
            : "";
    }
    onclickLikeToggler() {
        const togglerImg = this.showLikeToggler.querySelector("img");
        togglerImg.onclick = () => {
            this.showLike = !this.showLike;
            if (this.showLike === true) {
                togglerImg.src = "/img/heartLiked.svg";
            }
            else {
                togglerImg.src = "/img/heart.svg";
            }
            this.sortComments();
        };
    }
    filterLikedComments() {
        let shownComments = this.comments;
        if (this.showLike === true) {
            shownComments = this.comments.filter((comment) => comment.like === this.showLike);
        }
        return shownComments;
    }
    clearCommentList() {
        this.commentListElement.innerHTML = "";
    }
    addCommentActionListeners(commentElement, comment) {
        const commentIndex = this.getCommentIndex(comment.id);
        commentElement
            .querySelector(".like-action")
            .addEventListener("click", (e) => {
            comment.like = comment.like === undefined ? true : !comment.like;
            const likeIconKey = comment.like.toString();
            if (e.currentTarget instanceof Element) {
                e.currentTarget.querySelector("img").src =
                    this.likeIcons[likeIconKey].src;
                e.currentTarget.querySelector("span").innerHTML =
                    this.likeIcons[likeIconKey].text;
            }
            this.saveComments();
        });
        if (comment.commentType === "comment") {
            commentElement
                .querySelector(".answer-action")
                .addEventListener("click", (e) => {
                this.setCommentTypeLikeAnswer(comment.id);
                this.setAnsweredAuthor(comment.userName);
                this.textArea.focus();
            });
        }
        const rateBlock = commentElement.querySelector(".comment__rate");
        const rateActions = commentElement.querySelectorAll(".rate-action");
        rateActions.forEach((rateAction) => {
            rateAction.addEventListener("click", () => {
                const commentRater = this.getCommentaryRater(comment, this.user);
                let rater;
                if (commentRater.rater) {
                    rater = commentRater.rater;
                }
                else {
                    rater = { userId: this.user.userId, rateState: 0 };
                }
                if (rateAction.classList.contains("rate-plus")) {
                    if (rater === undefined || rater.rateState < 1) {
                        rater.rateState++;
                        comment.rating++;
                    }
                }
                else {
                    if (rater === undefined || rater.rateState > -1) {
                        rater.rateState--;
                        comment.rating--;
                    }
                }
                if (comment.raters === undefined) {
                    comment.raters = [];
                }
                if (commentRater.raterIndex === null) {
                    comment.raters.push(rater);
                }
                else {
                    comment.raters[commentRater.raterIndex] = rater;
                    /*
                        Если пользователь отменил свою оценку
                        Нажал сначала на плюс а потом на минус,
                        то убираем его из рейтеров
                    */
                    if (rater.rateState === 0) {
                        comment.raters.splice(commentRater.raterIndex, 1);
                    }
                }
                this.saveRating(rateBlock, comment, commentIndex);
                rateActions.forEach((ac) => {
                    ac.classList.remove("rate-disabled");
                });
                if (Math.abs(rater.rateState) === 1) {
                    rateAction.classList.add("rate-disabled");
                }
            });
        });
    }
    getCommentaryRater(comment, user) {
        let searchRaterIndex = null;
        let searchedRater = null;
        const commentIndex = this.getCommentIndex(comment.id);
        const ratedComment = this.comments[commentIndex];
        if (ratedComment !== undefined && ratedComment.raters !== undefined) {
            searchRaterIndex = ratedComment.raters.findIndex((o) => o.userId === user.userId);
            searchRaterIndex = searchRaterIndex < 0 ? null : searchRaterIndex;
            searchedRater = ratedComment.raters[searchRaterIndex];
        }
        return {
            rater: searchedRater,
            raterIndex: searchRaterIndex,
        };
    }
    getCommentIndex(commentId) {
        const commentIdx = this.comments.findIndex((c) => c.id === commentId);
        return commentIdx;
    }
    saveRating(rateBlock, comment, commentIndex) {
        if (comment.rating < 0) {
            rateBlock.classList.add("comment__rate-negative");
            rateBlock.classList.remove("comment__rate-positive");
        }
        else {
            rateBlock.classList.add("comment__rate-positive");
            rateBlock.classList.remove("comment__rate-negative");
        }
        rateBlock.innerHTML = Math.abs(comment.rating).toString();
        this.comments[commentIndex] = comment;
        this.saveComments();
    }
    setAnsweredAuthor(userName) {
        this.form.querySelector(".answer-to-author").innerHTML = userName
            ? `Ответить ${userName}`
            : "";
    }
    setCommentTypeLikeAnswer(id) {
        this.parentId = id;
        this.commentType = "answer";
    }
    createActionsBlock() {
        const actionsHtml = `
			<div class="comment-actions">
				<div class="comment__counter-info">
					<span>Комментарии</span>
					<span class="comment__counter secondary-color">(0)</span>
				</div>
				<div class="comment-actions__filters secondary-color">
					<div class="comment-actions__sorter">
						<div class="comment-actions__filters-text comment-sort-text">
							По дате
						</div>
						<img class="comment-asc-desc" src="img/arrow-down.svg" />
					</div>
					<div class="cursor-pointer show-liked">
						<div class="comment-actions__filters-text">Избранное</div>
						<img src="img/heart.svg" />
					</div>
				</div>
			</div>
		`;
        return commentaryUtils.createElementFromHTML(actionsHtml);
    }
    renderComment(comment) {
        var _a;
        let commentTypeTemplate = "";
        let commentTypeClass = "";
        let answerTemplate = `
			<div class="comment__answer-block answer-action" data-comment-id="${comment.id}">
				<img src="/img/answer.svg" />
				<span>Ответить</span>
			</div>
		`;
        const parentCommentElement = this.commentSection.querySelector(`[data-comment-id="${comment.parentId}"]`);
        if (comment.commentType === "answer") {
            const parentComment = this.comments.find((o) => o.id === comment.parentId);
            commentTypeTemplate = `
				<div class="comment__author-answered-wrap">
					<img src="/img/answer.svg" />
					<div class="comment__author-answered secondary-color">
						${parentComment.userName}
					</div>
				</div>
			`;
            answerTemplate = "";
            commentTypeClass = parentCommentElement ? "comment__answer" : "";
        }
        let likeTemplate = "";
        const likeValue = comment.like;
        likeTemplate = `
				<img src="${this.likeIcons[likeValue.toString()].src}" />
				<span>${this.likeIcons[likeValue.toString()].text}</span>
			`;
        const commentRater = this.getCommentaryRater(comment, this.user);
        const rater = commentRater.rater;
        const rateMinusDisabled = this.returnDisabledRateBtn(rater, -1);
        const ratePlusDisabled = this.returnDisabledRateBtn(rater, 1);
        const authorImage = this.findUserPhoto(comment.userId);
        const commentRating = Math.abs((_a = comment.rating) !== null && _a !== void 0 ? _a : 0);
        const commentRatingClass = comment.rating >= 0 ? "positive" : "negative";
        const commentTemplate = `
			<div class="comments__item comments__item-comment ${commentTypeClass}"
			data-parent-id="${comment.parentId}"
			data-comment-id="${comment.id}">

				<div class="comment-author__wrap">
					<img src="${authorImage.photo}" class="comment-author__avatar"/>
					<div class="comment-answer__wrap">
					<div class="comment-author__name">${comment.userName}</div>
					${commentTypeTemplate}
					</div>
					<div class="comment__public-date secondary-color">
						${comment.commentTime}
					</div>
				</div>

				<div class="comment__text-action-wrap">
					<span>
						${comment.text}
					</span>
				</div>

				<div class="comment__instruments secondary-color">
					${answerTemplate}
					<div class="comment__like-block like-action">
						${likeTemplate}
					</div>
					<div class="comment__rate-block">
						<img class="rate-action rate-minus ${rateMinusDisabled}" src="/img/rateMinus.svg" />
						<div class="comment__rate comment__rate-${commentRatingClass}">${commentRating}</div>
						<img class="rate-action rate-plus ${ratePlusDisabled}" src="/img/ratePlus.svg"/>
					</div>
				</div>
			</div>
		`;
        const commentElement = commentaryUtils.createElementFromHTML(commentTemplate);
        /*
            проверяем тип комментария.
            в зависимости от типа рисуем либо коммент либо ответ
        */
        if (comment.commentType === "comment") {
            this.commentListElement.appendChild(commentElement);
        }
        else {
            const commentChilds = this.commentListElement.querySelectorAll(`[data-parent-id="${comment.parentId}"]`);
            /*
                проверяем ответы.
                если есть то добавляем после последнего ответа
            */
            if (commentChilds.length >= 1) {
                commentChilds[commentChilds.length - 1].after(commentElement);
            }
            else {
                if (parentCommentElement) {
                    parentCommentElement.after(commentElement);
                }
                else {
                    this.commentListElement.append(commentElement);
                }
            }
        }
        const addedCommentElement = (this.commentSection.querySelector(`[data-comment-id="${comment.id}"]`));
        this.addCommentActionListeners(addedCommentElement, comment);
    }
    createForm() {
        const thisUserPhoto = this.findUserPhoto(this.user.userId);
        const html = `
			<form id="comments__form">
				<div class="comments__item">
					<div class="comment-author__wrap">
						<img src="${thisUserPhoto.photo}" class="comment-author__avatar"/>
						<div class="comment-author__name">${this.user.userName}</div>
						<div class="comment__text-limit secondary-color">
							Макс. 1000 символов
						</div>
					</div>
					<div class="comment__text-action-wrap">
						<textarea
							placeholder="Введите текст сообщения..."
							class="comment__form-textarea"
							role="textbox"
							contenteditable
							draggable="false"
							rows="1"
						></textarea>
						<div class="comment__send-btn-wrap">
							<span class="comment__send-btn-error"></span>
							<button type="button" class="comment__send-btn">
								Отправить
							</button>
						</div>
					</div>
				</div>
				<div class="answer-to-author"></div>
			</form>
		`;
        return commentaryUtils.createElementFromHTML(html);
    }
    createCommentList() {
        const html = `<div class="comment__list"></div>`;
        return commentaryUtils.createElementFromHTML(html);
    }
    createSortList() {
        const sortListHtml = '<ul class="comment-sort-list"></ul>';
        const sortElement = commentaryUtils.createElementFromHTML(sortListHtml);
        window.onclick = () => {
            sortElement.classList.remove("visible");
        };
        sortElement.onclick = (event) => event.stopPropagation();
        let i = 0;
        this.sortKeys.forEach((e) => {
            const sortLiHtml = `
				<li class="${i === 0 ? "active" : ""}">
					<img src="/img/check.svg">
					${e.title}
				</li>
			`;
            const sortLi = commentaryUtils.createElementFromHTML(sortLiHtml);
            sortLi.onclick = () => {
                sortElement.querySelector("li.active").classList.remove("active");
                sortLi.classList.add("active");
                this.sortComments(e.sortKey, this.sortAsc);
                this.sortTextElement.innerHTML = e.title;
            };
            sortElement.appendChild(sortLi);
            i++;
        });
        return sortElement;
    }
    findUserPhoto(userId) {
        var _a;
        const userPhotoIndex = this.usersPhoto.findIndex((p) => p.userId === userId);
        return ((_a = this.usersPhoto[userPhotoIndex]) !== null && _a !== void 0 ? _a : {
            userId: userId,
            photo: "/img/anonym.jpg",
        });
    }
    getUsersPhoto() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const usersPhoto = (_a = JSON.parse(localStorage.getItem("photos"))) !== null && _a !== void 0 ? _a : [];
            if (usersPhoto.length === 0) {
                for (const user in this.users) {
                    const response = yield fetch(`https://api.thecatapi.com/v1/images/search?limit=1`);
                    const resp = yield response.json();
                    usersPhoto.push({
                        userId: this.users[user].userId,
                        photo: resp[0].url,
                    });
                }
                localStorage.setItem("photos", JSON.stringify(usersPhoto));
            }
            return usersPhoto;
        });
    }
    scrollToAddedComment(commentId) {
        document
            .querySelector(`[data-comment-id="${commentId}"]`)
            .scrollIntoView({ block: "center", behavior: "smooth" });
    }
}
let commentarySystem = new CommentarySystem();
