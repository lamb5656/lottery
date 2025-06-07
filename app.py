from flask import Flask, request, jsonify
import random

app = Flask(__name__)

@app.route("/")
def index():
    return "抽選APIが動いてるにゃ！"

@app.route("/draw", methods=["POST"])
def draw():
    try:
        data = request.json
        num = int(data["numerator"])
        denom = int(data["denominator"])
        tries = int(data["times"])
        hit_count = int(data["hits_left"])
        total_count = int(data["total_left"])
    except Exception as e:
        return jsonify({"error": f"パラメータが正しくないにゃ: {e}"}), 400

    prob = num / denom
    hits = 0

    for _ in range(tries):
        if hit_count <= 0 or total_count <= 0:
            break
        if random.random() < prob:
            hit_count -= 1
            hits += 1
        total_count -= 1

    return jsonify({
        "result": f"{tries}回中 {hits}回当たりにゃ！",
        "hits_now": hits,
        "hits_left": hit_count,
        "total_left": total_count
    })
