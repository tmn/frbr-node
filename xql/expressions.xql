xquery version "3.0";

declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";
declare namespace json = "http://www.json.org";

declare option exist:serialize "method=json media-type=application/json";

let $dataset := collection('/db/frbrsearch/data/frbrxml')/marc:record[@f:type = 'http://iflastandards.info/ns/fr/frbr/frbrer/C1002']

for $node in $dataset
return
  <json:value json:array="true">
    <id>{data($node/@f:id)}</id>
    <type>expression</type>
    <content>{$node}</content>
  </json:value>