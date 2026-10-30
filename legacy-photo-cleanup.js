/* Removes only the retired camera feature's database, on explicit user action. */
(()=>{
'use strict';
const parent=document.querySelector('.parent-settings');if(!parent)return;
const section=document.createElement('section');section.className='legacy-photo-cleanup';
const heading=document.createElement('h3');heading.textContent='以前のカメラ写真の削除';
const description=document.createElement('p');description.textContent='撮影に使った端末・ブラウザで開いてください。このサイトに保存された以前のカメラ写真だけを削除します。学習ログ・評価・設定や、端末の写真アプリ内の写真は削除しません。別の公開先やローカルファイルで保存した写真は対象外です。';
const button=document.createElement('button');button.type='button';button.id='delete-legacy-photos';button.textContent='以前のカメラ写真を削除';
const status=document.createElement('p');status.setAttribute('role','status');
section.append(heading,description,button,status);parent.append(section);
button.addEventListener('click',()=>{
 if(button.disabled)return;
 if(!window.confirm('このサイトに保存された以前のカメラ写真をすべて削除します。元に戻せません。学習ログ・評価・設定は残ります。削除しますか？'))return;
 button.disabled=true;status.textContent='写真データを削除しています…';
 try{
  const request=window.indexedDB.deleteDatabase('math-solution-photos');
  request.onblocked=()=>{status.textContent='削除待ちです。以前のカメラ機能を開いている別のタブを閉じてください。閉じると削除を続けます。';};
  request.onerror=()=>{button.disabled=false;status.textContent='削除できませんでした。ブラウザの設定を確認して、もう一度お試しください。';};
  request.onsuccess=()=>{button.disabled=false;status.textContent='以前のカメラ写真の削除が完了しました（保存されていなかった場合も含みます）。学習ログ・評価・設定は残っています。';};
 }catch{button.disabled=false;status.textContent='この環境では写真の保存領域にアクセスできません。撮影に使った端末・ブラウザで開き直してください。';}
});
})();
