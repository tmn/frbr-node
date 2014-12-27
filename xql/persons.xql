xquery version "3.0";

declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";
declare namespace json = "http://www.json.org";

declare option exist:serialize "method=json media-type=application/json";

let $dataset := collection('/db/frbrsearch/data/frbrxml')/marc:record[@type = 'C1005']

for $node in $dataset
return
  <json:value json:array="true">
    <id>{data($node/@id)}</id>
    <type>person</type>
    <content>{$node}</content>
  </json:value>
