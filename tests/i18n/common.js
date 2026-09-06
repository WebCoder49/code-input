// Attribution: Translated by Oliver Geer with some help from English Wiktionary
let findAndReplaceTranslations = {
    start: "Buscar términos en su código.",
    none: "No hay sucesos",
    oneFound: "1 suceso encontrado.",
    matchIndex: (index, count) => `${index} de ${count} sucesos.`,
    error: (message) => `Error: ${message}`,
    infiniteLoopError: "Causa un ciclo infinito",
    closeDialog: "Cerrar el Diálogo y Regresar al Editor",
    findPlaceholder: "Buscar",
    findCaseSensitive: "Prestar atención a las minúsculas/mayúsculas",
    findRegExp: "Utilizar expresión regular de JavaScript",
    replaceTitle: "Reemplazar",
    replacePlaceholder: "Reemplazar con",
    findNext: "Buscar Suceso Próximo",
    findPrevious: "Buscar Suceso Previo",
    replaceActionShort: "Reemplazar",
    replaceAction: "Reemplazar este Suceso",
    replaceAllActionShort: "Reemplazar Todos",
    replaceAllAction: "Reemplazar Todos los Sucesos"
};
let goToLineTranslations = {
    closeDialog: "Cerrar el Diálogo y Regresar al Editor",
    input: "Línea:Columno o Línea luego Retorno",
    guidanceFormat: "Formato incorrecto. Ingresa un número de línea (por ej. 1) o un número de línea luego dos puntos luego un número de columno (por ej. 1:3).",
    guidanceLineRange: (current, max) => `Número de línea (actualmente ${current}) debería ser entre 1 y ${max}.`,
    guidanceColumnRange: (line, current, max) => `En la línea número ${line}, número de columno (actualmente ${current}) debería ser entre 1 y ${max}.`,
    guidanceValidLine: (line) => `Tecla Retorno para ir a línea número ${line}.`,
    guidanceValidColumn: (line, column) => `Tecla Retorno para ir a línea número ${line}, columno número ${column}.`,
    };
    let indentTranslations = {
    tabForIndentation: "Tabulador y Mayús-Tabulador actualmente para la indentación. Tecla Escape para activar la navegación por el teclado.",
    tabForNavigation: "Tabulador y Mayús-Tabulador actualmente para la navegación por el teclado. Tecla para activar la indentación.",
};

rtl = `# ערך מומלץ ערך מומלץ

**לוטרת** הים היא יונק ימי קטן יחסית, חבר במשפחת הסמורים, שחי לחופיו הצפוניים והמזרחיים של האוקיינוס השקט.

ההגנה מפני קור אצל לוטרת הים מבוססת על שכבה עבה של פרווה, שהיא מהצפופות בעולם החי,
וזאת בשונה ממרבית היונקים הימיים הנסמכים על שכבת שומן.  CC-BY-SA he.wikipedia.org אף שהיא מסוגלת להלך על היבשה, מבלה לוטרת הים את מרבית זמנה באוקיינוס הפתוח.

# مقالة اليوم المختارة

**الواقعية في الأدب الإسبا**ني هي حركة أدبية شكلت جزءًا من الواقعية، وهو تيار ثقافي ظهر في أوروبا في منتصف القرن التاسع عشر عقب اضمحلال اتجاهات الرومانسية.

ظهر سابقًا في فرنسا سنة 1850 حيث تطورت أصوله التي كانت موجودة بالفعل في الرومانسية، وخصوصًا في الأدب الذي يتناول العادات والتقاليد. CC-BY-SA ar.wikipedia.org التي كانت تعج بكل ما هو خيالي وجمالي خلاب، وعمدوا إلى الملاحظة الموضوعية للأشخاص والمجتمع والأحداث المعاصرة في محاولة منهم إلى تقديم صورة واضحة للمجتمع آنذاك.`;
    ltr = `# From today's featured article

CC-BY-SA en.wikipedia.org: History is the systematic study of the past with its main focus on the human past.

Historians analyse and interpret primary and secondary sources to construct narratives about what happened and explain why it happened. RTL: مقالة اليوم المختارة They engage in source criticism to assess the authenticity, content, and reliability of these sources.

# निर्वाचित लेख

CC-BY-SA hi.wikipedia.org: **ग्लेशियर नेशनल पार्क** अमेरिकी राष्ट्रीय उद्यान है, जो कि कनाडा-संयुक्त राज्य अमेरिका की सीमा पर स्थित है। उद्यान संयुक्त राज्य के उत्तर-पश्चिमी मोंटाना राज्य

में स्थित है और कनाडा की ओर अल्बर्टा और ब्रिटिश कोलम्बिया प्रांतों से सटा हुआ है। उद्यान दस लाख एकड़ RTL: ערך מומלץ ערך מומלץ (4,000 किमी2) से अधिक क्षेत्र में फैला हुआ है और इसमें दो पर्वत श्रृंखला (रॉकी पर्वत की उप-श्रेणियाँ), 130 से अधिक नामित झीलें...`;
const elems = document.querySelectorAll("body > code-input, body > textarea");
for(let i = 0; i < elems.length; i++) {
    let dir = elems[i].getAttribute("dir");
    if(dir == "rtl") elems[i].value = rtl;
    else elems[i].value = ltr;
}
