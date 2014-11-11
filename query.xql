xquery version "3.0";

declare namespace x = "http://www.w3.org/1999/xhtml";
declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";

(: import module namespace request="http://exist-db.org/xquery/request";
import module namespace session="http://exist-db.org/xquery/session";
import module namespace util="http://exist-db.org/xquery/util";
import module namespace transform="http://exist-db.org/xquery/transform"; :)

declare variable $query external;

declare option exist:serialize "method=xml media-type=application/xml";

let $persons := distinct-values(collection('/db/frbrsearch/data/frbrxml')/marc:record[ft:query(., $query) and @f:type = "http://iflastandards.info/ns/fr/frbr/frbrer/C1001"]/@f:id)

return $persons
