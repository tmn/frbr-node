xquery version "3.0";

declare namespace f = "http://idi.ntnu.no/frbrizer/";
declare namespace marc = "http://www.loc.gov/MARC21/slim";
declare namespace json = "http://www.json.org";

declare variable $query external;
declare variable $type external;

declare function local:getType() {
	switch($type)
		case "person" return 'C1005'
		case "work" return 'C1001'
		case "expression" return 'C1002'
		case "manifestation" return 'C1003'
		default return "notype"
};

declare option exist:serialize "method=json media-type=application/json";

let $dataset := collection('/db/frbrsearch/data/frbrxml')/marc:record[ft:query(., $query) and @type = local:getType()]

for $node in $dataset order by ft:score($node) descending
return
  <json:value json:array="true">
    <id>{data($node/@id)}</id>
    <type>{$type}</type>
    <score>{ft:score($node)}</score>
    <content>{$node}</content>
  </json:value>
