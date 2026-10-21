/**
 * Marks the document as script-enabled and reveals `.reveal` blocks as they
 * scroll into view. Content is visible by default; it is only hidden once this
 * script has run, so nothing stays invisible if JavaScript fails.
 */
const script = `(()=>{try{var d=document.documentElement;if(!('IntersectionObserver' in window))return;d.classList.add('js');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});var scan=function(){document.querySelectorAll('.reveal:not(.is-in),.reveal-stagger:not(.is-in)').forEach(function(el){io.observe(el)})};if(document.readyState!=='loading')scan();else document.addEventListener('DOMContentLoaded',scan);new MutationObserver(scan).observe(d,{childList:true,subtree:true})}catch(e){document.documentElement.classList.remove('js')}})();`;

export function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
