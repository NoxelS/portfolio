from api.core.search import apply_metadata_boosts, merge_reranked_results, metadata_boost


def test_metadata_boost_defaults_and_clamps() -> None:
    assert metadata_boost({}) == 1.0
    assert metadata_boost({"boost": "bad"}) == 1.0
    assert metadata_boost({"boost": 0}) == 0.1
    assert metadata_boost({"boost": 9}) == 3.0


def test_apply_metadata_boosts_can_promote_candidate_before_rerank_cap() -> None:
    candidates = [
        {"redis_key": "first", "boost": 1.0},
        {"redis_key": "second", "boost": 3.0},
    ]

    boosted = apply_metadata_boosts(candidates)

    assert boosted[0]["redis_key"] == "second"
    assert boosted[0]["metadata_boost"] == 3.0


def test_merge_reranked_results_keeps_rerank_score_and_adds_boosted_score() -> None:
    results = merge_reranked_results(
        [
            {"redis_key": "a", "rerank_score": 0.5, "relevance": 62.0, "boost": 2.0},
            {"redis_key": "b", "rerank_score": 0.8, "relevance": 69.0, "boost": 1.0},
        ]
    )

    assert results[0]["redis_key"] == "a"
    assert results[0]["rerank_score"] == 0.5
    assert results[0]["boosted_score"] == 1.0
