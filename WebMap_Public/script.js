//D:\Code\MyACTi_dev\MyACTi3.0\Admin\ACTi_V3\Masterpage\JavaScript\Backend.js

$(document).ready(function () {
    // 優先從 localStorage 讀取資料
    const obj_arr = get_array();
    const first_page = 3;
    var csslink = $('link[rel=stylesheet]').attr('href');
	
    // Check if the current page is a setting page, and initialize the jsonInput textarea
    // Setting分頁的邏輯不受JSON資料存在與否影響
    if ($('table[type="0"]').length) {
        const storedJson = localStorage.getItem('pageConfig');
        if (storedJson) {
            $('#jsonInput').val(storedJson);
            $('#resetJsonButton').show();
        } else {
            $('#jsonInput').val('localStorage中沒有資料，請貼上 JSON 字串並點擊「確定讀取」按鈕以儲存。');
            $('#resetJsonButton').hide();
        }
    }

    // 如果沒有讀取到資料，則不繼續執行後續呈現頁面的動作
    if (obj_arr) {
    
       // 這裡開始是原本的頁面呈現邏輯
       
       obj_arr.class_list.sort((m,n) => m.sort-n.sort).forEach(function(eachClass){
           //tab area
           $(`<input type="radio" name="panel-radio" id="${eachClass.id}" class="panel-control" ${eachClass.id == first_page ? "checked":""}>`)
               .attr('platform', eachClass.platform)
               .addClass('OuterTabs')
               .appendTo($('#nav_tab'));
           
           $(`<div><label for="${eachClass.id}">${eachClass.displayName}</label></div>`)
               .attr('platform', eachClass.platform)
               .attr('class_id',eachClass.id)
               .addClass('OuterTabs')
               .appendTo($('#nav_tab'));
	   
           //page area
           $(`<table><tr><th colspan="2"><span title="${eachClass.note}">${eachClass.displayName}</span></th></tr></table>`)
               .attr('platform', eachClass.platform)
               .attr('type', eachClass.id)
               .addClass('page-class')
               .addClass('class_'+eachClass.class)
               .appendTo($('body'));
               
           obj_arr.page_list.filter(x => x.display && x.class == eachClass.id ).sort((m,n) => m.index-n.index).forEach(function(eachPage){
               
               let tr_page = $(`<tr page="${eachPage.Title}"></tr>`);
               
               //ACTi3.0 URL格式特殊例外處理
               //hightlight可選多個css class，空格區分
               if(!eachPage.Title){
                   $(`<td><p>${eachClass.id}-${eachPage.index}請輸入文本</p></td>`)
                       .addClass(eachPage.hightlight)
                       .addClass(eachPage.Title ? "" : "noTitle")
                       .appendTo(tr_page);
               }
               else if(eachClass.id === 3){
                   // aws shorter url
                   $(`<td><a href="${eachClass.url_header_release}/${eachPage.url_type}/${eachPage.url}" target="_blank">${eachPage.Title}</a><button class="copy-button">點我複製</button></td>`)
                       .addClass(eachPage.hightlight)
                       .appendTo(tr_page);
                   // local full url
                   $(`<td><a href="${eachClass.url_header_local}type=${eachPage.url_type}&product=${eachPage.url}"  target="_blank">${eachPage.Title} (Local)</a></td>`)
                       .addClass('local-link')
                       .addClass(eachPage.hightlight)
                       .appendTo(tr_page);
                   //ACTi3.0 指定正式機Layer版本
                   $(`<td><a href="${eachClass.url_header_layer}type=${eachPage.url_type}&product=${eachPage.url}" target="_blank">${eachPage.Title} (full url)</a></td>`)
                       .addClass('full-link')
                       .addClass(eachPage.hightlight)
                       .appendTo(tr_page);
               }
               else if(eachClass.id === 6){
                   //乾脆另外獨立一個list算了，反正它整個都跟page的其他人無關
                   let _Title = eachPage.Title ? eachPage.Title:"請輸入文本 "
                   $(`<td><a href="${eachClass.url_header_release + eachPage.url}" target="_blank">${_Title}</a><button class="copy-button">點我複製</button></td>`)
                       .addClass(eachPage.hightlight)
                       .addClass(eachPage.Title ? "" : "noTitle")
                       .appendTo(tr_page);
               }
               else{
                   $(`<td><a href="${eachClass.url_header_release + eachPage.url}" target="_blank">${eachPage.Title}</a><button class="copy-button">點我複製</button></td>`)
                       .addClass(eachPage.hightlight)
                       .appendTo(tr_page);
                       
                   $(`<td><a href="${eachClass.url_header_local + eachPage.url}" target="_blank">${eachPage.Title} (Local)</a><button class="copy-button">點我複製</button></td>`)
                       .addClass('local-link')
                       .addClass(eachPage.hightlight)
                       .appendTo(tr_page);
               }
               
               $(`table[type="${eachPage.class}"]`).append(tr_page);
           });
       });
    }
	
    $("input[name=panel-radio]").on('change',function(){
        var Tab_Type = $(this).attr('id');
        $('table.page-class').hide();
        $(`table.page-class[type="${Tab_Type}"]`).show();
    })
    
    $('.copy-button').on('click', function() {
        const aElement = $(this).prev('a');

        if (aElement.length > 0) { 
            const href = aElement.attr('href');

            navigator.clipboard.writeText(href)
                .then(() => {
                    const $thisButton = $(this);
                    const originalText = $thisButton.text();
                    
                    $thisButton.text('已複製！');
                    
                    setTimeout(() => {
                        $thisButton.text(originalText);
                    }, 2000);
                })
                .catch(err => {
                    console.error('複製失敗:', err);
                });
        }
    });

    // 處理 Setting 分頁的按鈕事件
    $('.class_Setting').on('click','#saveJsonButton', function() {
        const jsonString = $('#jsonInput').val();
        if (jsonString.trim() === '') {
            $('#errorMessage').text('JSON 內容不能為空！');
            return;
        }

        try {
            JSON.parse(jsonString);
			console.log(JSON.parse(jsonString));
			console.log(jsonString);
            localStorage.setItem('pageConfig', jsonString);
			
            $('#errorMessage').text('JSON 儲存成功！頁面將自動重新整理...').css('color', 'green');
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (e) {
            $('#errorMessage').text('JSON 格式無效！請檢查錯誤。');
        }
    });

    $('#resetJsonButton').on('click', function() {
        localStorage.removeItem('pageConfig');
        location.reload();
    });

    $('#rearrangeButton').on('click', function() {
        const jsonString = $('#jsonInput').val();
        if (jsonString.trim() === '') {
            $('#errorMessage').text('JSON 內容不能為空！');
            return;
        }
        
        try {
            const data = JSON.parse(jsonString);
            if (data.class_list) {
                data.class_list.sort((m, n) => m.sort - n.sort);
            }
            if (data.page_list) {
                data.page_list.sort((m, n) => m.class - n.class || m.index - n.index);
            }
            $('#jsonInput').val(JSON.stringify(data, null, 4));
            $('#errorMessage').text('JSON 重新排列成功！').css('color', 'green');
        } catch (e) {
            $('#errorMessage').text('JSON 格式無效！請檢查錯誤。');
        }
    });

    // 第一動
    // 註解此行即可使初見即全部顯示(不影響功能)
    $(`input[name=panel-radio][id=${first_page}]`).change();

});

function changeStyle(sheet) {
    if($('link[rel=stylesheet]').attr('href') === './css/style_waffle.css'){
        $('link[rel=stylesheet]').attr('href','./css/style_dark.css');
        $(sheet).attr('src','./img/cityscape-star.svg');
    }else{
        $('link[rel=stylesheet]').attr('href','./css/style_waffle.css');
        $(sheet).attr('src','./img/cityscape.svg');
    }
}

function IamTray(){
    if($('.fruit-list > *').css('display') === 'none'){
        $('.fruit-list > *').show();
        $('.fruit-list img:last').attr('src','./img/open-store.svg');
    }
    else {
        $('.fruit-list > *').hide();
        $('.fruit-list img:last').show();
        $('.fruit-list img:last').attr('src','./img/closed-store.svg');
    }
}

function icecream(_target){
    if($(_target).attr('src') === './img/fish.svg'){
        $(_target).attr('src','./img/fishbone.svg');
    }
    else {
        $(_target).attr('src','./img/fish.svg');
    }
}

// 修改後的 get_array 函數，僅從 localStorage 讀取
function get_array(){
    const storedData = localStorage.getItem('pageConfig');
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            console.log('從 localStorage 讀取 JSON');
            return parsedData;
        } catch (e) {
            console.error('解析 localStorage 中的 JSON 失敗，將返回 null。');
        }
    }
    
    console.log('未找到 localStorage 資料，將返回 null。');
	const nullData =
	{
		class_list: [],
		page_list: [],
	}
    return null;
}